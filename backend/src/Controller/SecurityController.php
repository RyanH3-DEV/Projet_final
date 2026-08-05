<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

class SecurityController extends AbstractController
{
    #[Route('/api/connexion_directe', name: 'api_login_direct', methods: ['POST', 'OPTIONS'])]
    public function login(Request $request, UserRepository $userRepo, UserPasswordHasherInterface $hasher, EntityManagerInterface $em, MailerInterface $mailer): JsonResponse
    {
        if ($request->getMethod() === 'OPTIONS') return new JsonResponse(null, 204);

        $data = json_decode($request->getContent(), true);
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';

        $user = $userRepo->findOneBy(['email' => $email]);

        if (!$user || !$hasher->isPasswordValid($user, $password)) {
            return new JsonResponse(['message' => 'Identifiants incorrects.'], 401);
        }

        if (!$user->isVerified()) {
            return new JsonResponse(['message' => 'Votre compte n\'est pas encore activé. Vérifiez vos e-mails.'], 403);
        }

        // Génération du code 2FA à 6 chiffres
        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $user->setTwoFactorCode($code);
        $user->setTwoFactorCodeExpiresAt(new \DateTimeImmutable('+10 minutes'));
        $em->flush();

        $mail = (new Email())
            ->from('r.sebbouh@h3hitema.fr')
            ->to($user->getEmail())
            ->subject('Votre code de connexion Cyna')
            ->html("<p>Bonjour {$user->getPrenom()},</p><p>Votre code de vérification est : <strong>{$code}</strong></p><p>Ce code expire dans 10 minutes.</p>");

        try {
            $mailer->send($mail);
        } catch (\Exception $e) {
            return new JsonResponse(['message' => 'Erreur lors de l\'envoi du code : ' . $e->getMessage()], 500);
        }

        // Réponse partielle : pas de token tant que le code 2FA n'est pas validé
        return new JsonResponse([
            'requiresTwoFactor' => true,
            'email' => $user->getEmail(),
        ]);
    }

    #[Route('/api/connexion_2fa_verify', name: 'api_login_2fa_verify', methods: ['POST', 'OPTIONS'])]
    public function verifyTwoFactor(Request $request, UserRepository $userRepo, EntityManagerInterface $em): JsonResponse
    {
        if ($request->getMethod() === 'OPTIONS') return new JsonResponse(null, 204);

        $data = json_decode($request->getContent(), true);
        $email = $data['email'] ?? '';
        $code = $data['code'] ?? '';

        $user = $userRepo->findOneBy(['email' => $email]);

        if (!$user || !$user->getTwoFactorCode()) {
            return new JsonResponse(['message' => 'Aucune demande de connexion en cours.'], 400);
        }

        if ($user->getTwoFactorCodeExpiresAt() < new \DateTimeImmutable()) {
            $user->setTwoFactorCode(null);
            $user->setTwoFactorCodeExpiresAt(null);
            $em->flush();
            return new JsonResponse(['message' => 'Code expiré, veuillez vous reconnecter.'], 400);
        }

        if ($user->getTwoFactorCode() !== $code) {
            return new JsonResponse(['message' => 'Code incorrect.'], 401);
        }

        // Code validé : on nettoie et on délivre le token
        $user->setTwoFactorCode(null);
        $user->setTwoFactorCodeExpiresAt(null);
        $em->flush();

        return new JsonResponse([
            'token' => 'eyJhbGci.eyJzdWIiOiIxIn0.signature',
            'user' => [
                'id'     => $user->getId(),
                'email'  => $user->getEmail(),
                'nom'    => $user->getNom(),
                'prenom' => $user->getPrenom(),
                'roles'  => $user->getRoles(),
                'avatar' => $user->getAvatar()
            ]
        ]);
    }

    #[Route('/api/inscription-securisee', name: 'api_register', methods: ['POST', 'OPTIONS'])]
    public function register(
        Request $request,
        UserPasswordHasherInterface $hasher,
        EntityManagerInterface $em,
        MailerInterface $mailer
    ): JsonResponse {
        if ($request->getMethod() === 'OPTIONS') return new JsonResponse(null, 204);

        $data = json_decode($request->getContent(), true);
        $emailAddress = $data['email'] ?? '';

        if ($em->getRepository(User::class)->findOneBy(['email' => $emailAddress])) {
            return new JsonResponse(['message' => 'Cet e-mail est déjà utilisé.'], 400);
        }

        $user = new User();
        $user->setEmail($emailAddress);
        $user->setPrenom($data['prenom'] ?? '');
        $user->setNom($data['nom'] ?? '');
        $user->setPassword($hasher->hashPassword($user, $data['password'] ?? ''));
        $user->setIsVerified(false);
        $user->setRoles(['ROLE_USER']);

        $user->setNewsletter($data['newsletter'] ?? false);
        $user->setUnsubscribeToken(bin2hex(random_bytes(32)));
        $user->setLastNewsletterSentAt(null);

        $token = bin2hex(random_bytes(32));
        $user->setConfirmationToken($token);

        $initiales = urlencode($user->getPrenom() . ' ' . $user->getNom());
        $user->setAvatar("https://ui-avatars.com/api/?name=$initiales&background=00e5ff&color=050810");

        $em->persist($user);
        $em->flush();

        $frontendUrl = rtrim($_ENV['FRONTEND_URL'] ?? 'http://localhost:5173', '/');

        $email = (new Email())
            ->from('r.sebbouh@h3hitema.fr')
            ->to($user->getEmail())
            ->subject('Confirmation de compte Cyna')
            ->html("<p>Bonjour {$user->getPrenom()}, cliquez ici pour activer votre compte : <a href='{$frontendUrl}/confirmation?token={$token}'>Activer mon compte</a></p>");

        try {
            $mailer->send($email);
        } catch (\Exception $e) {
            return new JsonResponse(['status' => 'OK', 'mail_error' => $e->getMessage()], 201);
        }

        return new JsonResponse(['status' => 'OK'], 201);
    }

    #[Route('/api/confirmation_directe_email', name: 'api_confirm_direct', methods: ['GET', 'OPTIONS'])]
    public function confirmerEmail(Request $request, UserRepository $userRepo, EntityManagerInterface $em): JsonResponse
    {
        if ($request->getMethod() === 'OPTIONS') return new JsonResponse(null, 204);

        $token = $request->query->get('token');
        $user = $userRepo->findOneBy(['confirmationToken' => $token]);

        if (!$user) {
            return new JsonResponse(['message' => 'Lien invalide ou déjà utilisé.'], 400);
        }

        $user->setIsVerified(true);
        $user->setConfirmationToken(null);
        $em->flush();

        return new JsonResponse([
            'message' => 'Compte activé avec succès !',
            'user' => [
                'id'     => $user->getId(),
                'email'  => $user->getEmail(),
                'nom'    => $user->getNom(),
                'prenom' => $user->getPrenom(),
                'roles'  => $user->getRoles(),
                'avatar' => $user->getAvatar(),
            ],
            'token' => 'eyJhbGci.eyJzdWIiOiIxIn0.signature',
        ], 200);
    }
}
