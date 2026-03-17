<?php

namespace App\Controller;

use App\Repository\UserRepository;
use App\Repository\OrderRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/superadmin', name: 'api_superadmin_')]
class SuperAdminController extends AbstractController
{
    public function __construct(
        private UserRepository $userRepo,
        private EntityManagerInterface $em,
    ) {}

    private function checkSuperAdmin(Request $request): ?JsonResponse
    {
        $email = $request->headers->get('X-User-Email');

        if (!$email) {
            return new JsonResponse(['error' => 'Header X-User-Email manquant'], 401);
        }

        $user = $this->userRepo->findOneBy(['email' => $email]);

        if (!$user) {
            return new JsonResponse(['error' => 'Utilisateur introuvable'], 404);
        }

        if (!in_array('ROLE_SUPER_ADMIN', $user->getRoles())) {
            return new JsonResponse(['error' => 'Accès refusé'], 403);
        }

        return null;
    }

    #[Route('/users', name: 'users', methods: ['GET', 'OPTIONS'])]
    public function listUsers(Request $request): JsonResponse
    {
        if ($request->getMethod() === 'OPTIONS') return new JsonResponse(null, 204);
        if ($err = $this->checkSuperAdmin($request)) return $err;

        $users = $this->userRepo->findAll();

        return new JsonResponse(array_map(fn($u) => [
            'id'         => $u->getId(),
            'email'      => $u->getEmail(),
            'prenom'     => $u->getPrenom(),
            'nom'        => $u->getNom(),
            'roles'      => $u->getRoles(),
            'isVerified' => $u->isVerified(),
        ], $users));
    }

    #[Route('/users/{id}/role', name: 'user_role', methods: ['PUT', 'OPTIONS'])]
    public function changeRole(int $id, Request $request): JsonResponse
    {
        if ($request->getMethod() === 'OPTIONS') return new JsonResponse(null, 204);
        if ($err = $this->checkSuperAdmin($request)) return $err;

        $user = $this->userRepo->find($id);
        if (!$user) return new JsonResponse(['error' => 'Utilisateur introuvable'], 404);

        $data    = json_decode($request->getContent(), true);
        $role    = $data['role'] ?? 'ROLE_USER';
        $allowed = ['ROLE_USER', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'];

        if (!in_array($role, $allowed)) {
            return new JsonResponse(['error' => 'Rôle invalide'], 400);
        }

        $callerEmail = $request->headers->get('X-User-Email');
        if ($user->getEmail() === $callerEmail) {
            return new JsonResponse(['error' => 'Impossible de modifier son propre rôle'], 403);
        }

        $user->setRoles($role === 'ROLE_USER' ? [] : [$role]);
        $this->em->flush();

        return new JsonResponse(['success' => true, 'roles' => $user->getRoles()]);
    }

    #[Route('/users/{id}', name: 'user_delete', methods: ['DELETE', 'OPTIONS'])]
    public function deleteUser(int $id, Request $request): JsonResponse
    {
        if ($request->getMethod() === 'OPTIONS') return new JsonResponse(null, 204);
        if ($err = $this->checkSuperAdmin($request)) return $err;

        $user = $this->userRepo->find($id);
        if (!$user) return new JsonResponse(['error' => 'Utilisateur introuvable'], 404);

        $callerEmail = $request->headers->get('X-User-Email');
        if ($user->getEmail() === $callerEmail) {
            return new JsonResponse(['error' => 'Impossible de supprimer son propre compte'], 403);
        }

        $this->em->remove($user);
        $this->em->flush();

        return new JsonResponse(['success' => true]);
    }

    #[Route('/stats', name: 'stats', methods: ['GET', 'OPTIONS'])]
    public function advancedStats(Request $request, OrderRepository $orderRepo): JsonResponse
    {
        if ($request->getMethod() === 'OPTIONS') return new JsonResponse(null, 204);
        if ($err = $this->checkSuperAdmin($request)) return $err;

        $orders   = $orderRepo->findAll();
        $totalCA  = 0;
        $byMonth  = [];
        $byMethod = ['stripe' => 0, 'paypal' => 0];

        foreach ($orders as $order) {
            $total    = (float) $order->getTotal();
            $totalCA += $total;

            $month   = $order->getCreatedAt()?->format('Y-m') ?? 'inconnu';
            $byMonth[$month] = ($byMonth[$month] ?? 0) + $total;

            $method  = $order->getPaymentMethod() ?? 'stripe';
            $byMethod[$method] = ($byMethod[$method] ?? 0) + 1;
        }

        ksort($byMonth);

        return new JsonResponse([
            'totalCA'     => round($totalCA, 2),
            'totalOrders' => count($orders),
            'byMonth'     => array_map(fn($m, $v) => ['month' => $m, 'total' => round($v, 2)], array_keys($byMonth), $byMonth),
            'byMethod'    => $byMethod,
            'totalUsers'  => count($this->userRepo->findAll()),
        ]);
    }

    #[Route('/security-logs', name: 'security_logs', methods: ['GET', 'OPTIONS'])]
    public function securityLogs(Request $request): JsonResponse
    {
        if ($request->getMethod() === 'OPTIONS') return new JsonResponse(null, 204);
        if ($err = $this->checkSuperAdmin($request)) return $err;

        $logFile = $this->getParameter('kernel.project_dir') . '/var/log/dev.log';
        $logs    = [];

        if (file_exists($logFile)) {
            $lines = array_slice(file($logFile), -200);
            foreach ($lines as $line) {
                if (str_contains($line, 'SECURITY') || str_contains($line, 'BLOCKED') || str_contains($line, 'ATTACK')) {
                    $logs[] = trim($line);
                }
            }
        }

        return new JsonResponse([
            'logs'  => array_slice(array_reverse($logs), 0, 50),
            'count' => count($logs),
        ]);
    }
}
