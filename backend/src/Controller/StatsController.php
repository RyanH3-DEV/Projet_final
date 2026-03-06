<?php
namespace App\Controller;

use App\Entity\PageView;
use App\Repository\PageViewRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/stats', name: 'api_stats_')]
class StatsController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em,
        private PageViewRepository $pageViewRepo,
    ) {}

    #[Route('/track', name: 'track', methods: ['POST', 'OPTIONS'])]
    public function track(Request $request): JsonResponse
    {
        if ($request->getMethod() === 'OPTIONS') return new JsonResponse(null, 204);

        $data = json_decode($request->getContent(), true);
        $ua   = $request->headers->get('User-Agent', '');
        $ip   = $request->getClientIp();

        $view = new PageView();
        $view->setPage($data['page'] ?? 'unknown');
        $view->setBrowser($this->detectBrowser($ua));
        $view->setOs($this->detectOs($ua));
        $view->setIp(hash('sha256', $ip));
        $view->setCountry($this->detectCountry($request));

        $this->em->persist($view);
        $this->em->flush();

        return new JsonResponse(['ok' => true]);
    }

    #[Route('/dashboard', name: 'dashboard', methods: ['GET', 'OPTIONS'])]
public function dashboard(Request $request): JsonResponse
{
    if ($request->getMethod() === 'OPTIONS') return new JsonResponse(null, 204);

    $adminKey    = $request->headers->get('X-Admin-Key');
    $expectedKey = $_ENV['ADMIN_STATS_KEY'] ?? 'books-admin-2025';

    if ($adminKey !== $expectedKey) {
        return new JsonResponse(['error' => 'Accès refusé'], 403);
    }

    return new JsonResponse([
        'visits' => [
            'total'  => $this->pageViewRepo->countTotal(),
            'today'  => $this->pageViewRepo->countToday(),
            'byPage' => $this->pageViewRepo->countByPage(),
            'byDay'  => $this->pageViewRepo->countByDay(30),
        ],
        'browsers' => $this->pageViewRepo->countByBrowser(),
        'os'       => $this->pageViewRepo->countByOs(),
    ]);
}

    private function detectBrowser(string $ua): string
    {
        if (str_contains($ua, 'Edg'))     return 'Edge';
        if (str_contains($ua, 'Chrome'))  return 'Chrome';
        if (str_contains($ua, 'Firefox')) return 'Firefox';
        if (str_contains($ua, 'Safari'))  return 'Safari';
        if (str_contains($ua, 'Opera'))   return 'Opera';
        return 'Autre';
    }

    private function detectOs(string $ua): string
    {
        if (str_contains($ua, 'Windows')) return 'Windows';
        if (str_contains($ua, 'Mac'))     return 'MacOS';
        if (str_contains($ua, 'Linux'))   return 'Linux';
        if (str_contains($ua, 'Android')) return 'Android';
        if (str_contains($ua, 'iPhone') || str_contains($ua, 'iPad')) return 'iOS';
        return 'Autre';
    }

    private function detectCountry(Request $request): string
    {
        return $request->headers->get('CF-IPCountry', 'Inconnu');
    }
}
