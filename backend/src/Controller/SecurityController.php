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
use Symfony\Component\RateLimiter\RateLimiterFactory;
use Symfony\Component\DependencyInjection\Attribute\Target;

class SecurityController extends AbstractController
{
    #[Route('/api/login_check', name: 'api_login_check', methods: ['POST', 'OPTIONS'])]
    public function login(
        Request $request,
        UserRepository $userRepository,
        UserPasswordHasherInterface $hasher,
        #[Target('login_limiter')] RateLimiterFactory $loginLimiter
    ): JsonResponse {
        if ($request->getMethod() === 'OPTIONS') {
            return new JsonResponse(null, 204);
        }

        $limiter = $loginLimiter->create($request->getClientIp());

        if (false === $limiter->consume(1)->isAccepted()) {
            return new JsonResponse(['message' => 'Trop de tentatives. Veuillez patienter 5 minutes.'], 429);
        }

        $data = json_decode($request->getContent(), true);
        $user = $userRepository->findOneBy(['email' => $data['email'] ?? '']);

        if (!$user || !$hasher->isPasswordValid($user, $data['password'] ?? '')) {
            return new JsonResponse(['message' => 'Identifiants invalides. Si vous avez oublié votre mot de passe, utilisez la fonctionnalité Mot de passe oublié.'], 401);
        }

        if (!$user->isVerified()) {
            return new JsonResponse(['message' => 'Veuillez vérifier votre boîte e-mail pour confirmer votre compte.'], 403);
        }

        $limiter->reset();

        return new JsonResponse([
            'token' => bin2hex(random_bytes(32)),
            'user' => [
                'email'  => $user->getEmail(),
                'nom'    => $user->getNom(),
                'prenom' => $user->getPrenom(),
                'avatar' => $user->getAvatar(),
                'roles'  => $user->getRoles(),
            ]
        ]);
    }

    #[Route('/api/connexion_directe', name: 'api_connexion_directe', methods: ['POST', 'OPTIONS'])]
    public function connexionDirecte(
        Request $request,
        UserRepository $userRepository,
        UserPasswordHasherInterface $hasher,
        MailerInterface $mailer,
        EntityManagerInterface $em,
        #[Target('login_limiter')] RateLimiterFactory $loginLimiter
    ): JsonResponse {
        if ($request->getMethod() === 'OPTIONS') {
            return new JsonResponse(null, 204);
        }

        $limiter = $loginLimiter->create($request->getClientIp());

        if (false === $limiter->consume(1)->isAccepted()) {
            return new JsonResponse(['message' => 'Trop de tentatives. Veuillez patienter 5 minutes.'], 429);
        }

        $data = json_decode($request->getContent(), true);
        $user = $userRepository->findOneBy(['email' => $data['email'] ?? '']);

        if (!$user || !$hasher->isPasswordValid($user, $data['password'] ?? '')) {
            return new JsonResponse(['message' => 'Identifiants invalides. Si vous avez oublié votre mot de passe, utilisez la fonctionnalité Mot de passe oublié.'], 401);
        }

        if (!$user->isVerified()) {
            return new JsonResponse(['message' => 'Veuillez vérifier votre boîte e-mail pour confirmer votre compte.'], 403);
        }

        $limiter->reset();

        // Génération du code de vérification à 6 chiffres
        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $user->setTwoFactorCode($code);
        $user->setTwoFactorCodeExpiresAt((new \DateTimeImmutable())->modify('+10 minutes'));
        $em->flush();

        $email = (new Email())
            ->from($_ENV['MAILER_FROM'] ?? 'no-reply@cyna-it.fr')
            ->to($user->getEmail())
            ->subject('Votre code de vérification Cyna')
            ->html("<p>Votre code de vérification est : <strong style='font-size:20px'>{$code}</strong></p><p>Ce code expire dans 10 minutes.</p>");

        try {
            $mailer->send($email);
        } catch (\Exception $e) {
            return new JsonResponse(['message' => 'Impossible d\'envoyer le code de vérification. Réessayez plus tard.'], 500);
        }

        return new JsonResponse(['requiresTwoFactor' => true], 200);
    }

    #[Route('/api/connexion_2fa_verify', name: 'api_connexion_2fa_verify', methods: ['POST', 'OPTIONS'])]
    public function connexion2faVerify(
        Request $request,
        UserRepository $userRepository,
        EntityManagerInterface $em
    ): JsonResponse {
        if ($request->getMethod() === 'OPTIONS') {
            return new JsonResponse(null, 204);
        }

        $data = json_decode($request->getContent(), true);
        $user = $userRepository->findOneBy(['email' => $data['email'] ?? '']);
        $codeSaisi = $data['code'] ?? '';

        if (!$user || !$user->getTwoFactorCode()) {
            return new JsonResponse(['message' => 'Aucune vérification en attente pour ce compte.'], 400);
        }

        if ($user->getTwoFactorCodeExpiresAt() < new \DateTimeImmutable()) {
            $user->setTwoFactorCode(null);
            $user->setTwoFactorCodeExpiresAt(null);
            $em->flush();
            return new JsonResponse(['message' => 'Code expiré. Veuillez vous reconnecter.'], 401);
        }

        if (!hash_equals($user->getTwoFactorCode(), $codeSaisi)) {
            return new JsonResponse(['message' => 'Code de vérification invalide.'], 401);
        }

        // Code validé : on le supprime pour empêcher toute réutilisation
        $user->setTwoFactorCode(null);
        $user->setTwoFactorCodeExpiresAt(null);
        $em->flush();

        return new JsonResponse([
            'token' => bin2hex(random_bytes(32)),
            'user' => [
                'email'  => $user->getEmail(),
                'nom'    => $user->getNom(),
                'prenom' => $user->getPrenom(),
                'avatar' => $user->getAvatar(),
                'roles'  => $user->getRoles(),
            ]
        ]);
    }

    #[Route('/api/inscription-securisee', name: 'api_register', methods: ['POST', 'OPTIONS'])]
    public function register(
        Request $request,
        MailerInterface $mailer,
        UserPasswordHasherInterface $passwordHasher,
        UserRepository $userRepository,
        EntityManagerInterface $em
    ): JsonResponse {
        if ($request->getMethod() === 'OPTIONS') {
            return new JsonResponse(null, 204);
        }

        $data = json_decode($request->getContent(), true);
        $emailAddress = $data['email'] ?? '';
        $password = $data['password'] ?? '';

        if (!preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/', $password)) {
            return new JsonResponse(['message' => 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.'], 400);
        }

        if ($userRepository->findOneBy(['email' => $emailAddress])) {
            return new JsonResponse(['message' => 'Cet e-mail est déjà utilisé.'], 400);
        }

        $user = new User();
        $user->setEmail($emailAddress);
        $user->setPrenom($data['prenom'] ?? '');
        $user->setNom($data['nom'] ?? '');

        if (isset($data['avatar']) && method_exists($user, 'setAvatar')) {
             $user->setAvatar($data['avatar']);
        }

        $user->setPassword($passwordHasher->hashPassword($user, $password));
        $user->setIsVerified(false);

        $token = bin2hex(random_bytes(32));
        $user->setConfirmationToken($token);

        $em->persist($user);
        $em->flush();

        $frontendUrl = rtrim($_ENV['FRONTEND_URL'] ?? 'http://localhost:3000', '/');

        $email = (new Email())
            ->from($_ENV['MAILER_FROM'] ?? 'no-reply@cyna-it.fr')
            ->to($user->getEmail())
            ->subject('Confirmation de votre compte Cyna')
            ->html("<p>Cliquez sur ce lien pour confirmer votre inscription : <a href='{$frontendUrl}/confirmation?token={$token}'>Confirmer mon compte</a></p>");

        try {
            $mailer->send($email);
        } catch (\Exception $e) {
        }

        return new JsonResponse(['status' => 'OK'], 201);
    }

    #[Route('/api/forgot-password', name: 'api_forgot_password', methods: ['POST', 'OPTIONS'])]
    public function forgotPassword(
        Request $request,
        UserRepository $userRepository,
        MailerInterface $mailer,
        EntityManagerInterface $em
    ): JsonResponse {
        if ($request->getMethod() === 'OPTIONS') {
            return new JsonResponse(null, 204);
        }

        $data = json_decode($request->getContent(), true);
        $user = $userRepository->findOneBy(['email' => $data['email'] ?? '']);

        if (!$user) {
            return new JsonResponse(['message' => 'Si cette adresse existe, un e-mail a été envoyé.'], 200);
        }

        $token = bin2hex(random_bytes(32));
        $user->setResetToken($token);
        $user->setResetTokenExpiresAt((new \DateTimeImmutable())->modify('+24 hours'));

        $em->flush();

        $frontendUrl = rtrim($_ENV['FRONTEND_URL'] ?? 'http://localhost:3000', '/');

        $email = (new Email())
            ->from($_ENV['MAILER_FROM'] ?? 'no-reply@cyna-it.fr')
            ->to($user->getEmail())
            ->subject('Réinitialisation de votre mot de passe Cyna')
            ->html("<p>Cliquez sur ce lien pour réinitialiser votre mot de passe (valide 24h) : <a href='{$frontendUrl}/reset-password?token={$token}'>Réinitialiser</a></p>");

        try {
            $mailer->send($email);
        } catch (\Exception $e) {
        }

        return new JsonResponse(['message' => 'Si cette adresse existe, un e-mail a été envoyé.'], 200);
    }

    #[Route('/api/reset-password', name: 'api_reset_password', methods: ['POST', 'OPTIONS'])]
    public function resetPassword(
        Request $request,
        UserRepository $userRepository,
        UserPasswordHasherInterface $hasher,
        EntityManagerInterface $em
    ): JsonResponse {
        if ($request->getMethod() === 'OPTIONS') {
            return new JsonResponse(null, 204);
        }

        $data = json_decode($request->getContent(), true);
        $token = $data['token'] ?? null;
        $newPassword = $data['password'] ?? '';

        if (!$token) {
            return new JsonResponse(['message' => 'Token manquant.'], 400);
        }

        if (!preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/', $newPassword)) {
            return new JsonResponse(['message' => 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.'], 400);
        }

        $user = $userRepository->findOneBy(['resetToken' => $token]);

        if (!$user || $user->getResetTokenExpiresAt() < new \DateTimeImmutable()) {
            return new JsonResponse(['message' => 'Lien invalide ou expiré.'], 400);
        }

        $user->setPassword($hasher->hashPassword($user, $newPassword));
        $user->setResetToken(null);
        $user->setResetTokenExpiresAt(null);
        $em->flush();

        return new JsonResponse(['message' => 'Mot de passe réinitialisé avec succès.'], 200);
    }
}
