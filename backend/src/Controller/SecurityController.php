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
            return new JsonResponse(['message' => 'Identifiants invalides.'], 401);
        }

        if (!$user->isVerified()) {
            return new JsonResponse(['message' => 'Compte non vérifié.'], 403);
        }

        $limiter->reset();

        return new JsonResponse([
            'user' => [
                'email' => $user->getEmail(),
                'nom' => $user->getNom(),
                'prenom' => $user->getPrenom(),
                'avatar' => $user->getAvatar()
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

        // 1. Vérification des CGV
        if (!isset($data['cgv']) || $data['cgv'] !== true) {
            return new JsonResponse(['message' => "Vous devez accepter les conditions pour continuer."], 400);
        }

        // 2. Vérification de l'âge
        if (!isset($data['dateNaissance']) || empty($data['dateNaissance'])) {
            return new JsonResponse(['message' => "La date de naissance est obligatoire."], 400);
        }

        $birthDate = new \DateTime($data['dateNaissance']);
        $now = new \DateTime();
        $age = $birthDate->diff($now)->y;

        if ($age < 18) {
            return new JsonResponse(['message' => "Vous ne pouvez  pas vous inscrire si vous etes  mineur."], 400);
        }

        // 3. Vérification de l'email
        if ($userRepository->findOneBy(['email' => $data['email']])) {
            return new JsonResponse(['message' => "Cet email est déjà utilisé par un autre compte."], 400);
        }

        // 4. Création de l'utilisateur
        $user = new User();
        $user->setEmail($data['email']);
        $user->setPrenom($data['prenom']);
        $user->setNom($data['nom']);

        // Je vérifie si un avatar a été envoyé, sinon je n'essaie pas de le setter (évite une erreur si l'entité n'a pas ce champ)
        if (isset($data['avatar']) && method_exists($user, 'setAvatar')) {
             $user->setAvatar($data['avatar']);
        }

        $user->setPassword($passwordHasher->hashPassword($user, $data['password']));
        $user->setIsVerified(false);

        $token = bin2hex(random_bytes(32));
        $user->setConfirmationToken($token);

        $em->persist($user);
        $em->flush();

        // Envoi de l'email fictif
        $email = (new Email())
            ->from('livre@gmail.com')
            ->to($user->getEmail())
            ->subject('Confirmation de compte')
            ->html("<p>Cliquez ici pour confirmer : <a href='http://localhost:3000/confirmation?token=$token'>Confirmer</a></p>");

        try {
            $mailer->send($email);
        } catch (\Exception $e) {
            // Optionnel: Gérer l'erreur d'envoi de mail sans bloquer l'inscription
        }

        return new JsonResponse(['status' => 'OK'], 201);
    }

    #[Route('/api/reset-password-direct', name: 'api_reset_password_direct', methods: ['POST', 'OPTIONS'])]
    public function resetPasswordDirect(
        Request $request,
        UserRepository $userRepository,
        UserPasswordHasherInterface $hasher,
        EntityManagerInterface $em
    ): JsonResponse {
        if ($request->getMethod() === 'OPTIONS') {
            return new JsonResponse(null, 204);
        }

        $data = json_decode($request->getContent(), true);
        $user = $userRepository->findOneBy(['email' => $data['email'] ?? '']);

        if (!$user) {
            return new JsonResponse(['message' => 'Utilisateur non trouvé.'], 404);
        }

        $user->setPassword($hasher->hashPassword($user, $data['password']));
        $em->flush();

        return new JsonResponse(['message' => 'Succès'], 200);
    }
}
