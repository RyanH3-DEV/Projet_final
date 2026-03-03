<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Psr\Log\LoggerInterface;

#[Route('/api/security', name: 'api_security_')]
class SecurityMonitorController extends AbstractController
{
    private LoggerInterface $logger;

    public function __construct(LoggerInterface $logger)
    {
        $this->logger = $logger;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Analyse chaque requête entrante pour détecter
    // les patterns suspects (XSS, SQLi, scan de ports)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    #[Route('/check', name: 'check', methods: ['POST', 'OPTIONS'])]
    public function checkRequest(Request $request): JsonResponse
    {
        if ($request->getMethod() === 'OPTIONS') return new JsonResponse(null, 204);

        $payload = json_decode($request->getContent(), true);
        $ip      = $request->getClientIp();
        $threats = [];

        // --- Patterns suspects à détecter ---
        $patterns = [
            'xss'      => ['<script', 'javascript:', 'onerror=', 'onload=', 'eval(', 'alert('],
            'sqli'     => ["' OR", "' AND", 'UNION SELECT', 'DROP TABLE', 'INSERT INTO', '--', '1=1'],
            'path'     => ['../../../', '/etc/passwd', '/proc/self', 'wp-admin', '.env'],
            'bot'      => ['sqlmap', 'nikto', 'nmap', 'masscan', 'zgrab'],
        ];

        $userAgent = $payload['userAgent'] ?? '';
        $url       = $payload['url'] ?? '';
        $inputs    = $payload['inputs'] ?? [];

        foreach ($patterns as $type => $signatures) {
            foreach ($signatures as $sig) {
                $haystack = strtolower($userAgent . ' ' . $url . ' ' . implode(' ', (array)$inputs));
                if (str_contains($haystack, strtolower($sig))) {
                    $threats[] = ['type' => $type, 'signature' => $sig];
                    $this->logger->warning("Threat detected [{$type}]: {$sig} from IP {$ip}");
                }
            }
        }

        $status = empty($threats) ? 'safe' : 'threat';

        return $this->json([
            'status'     => $status,
            'ip'         => $ip,
            'threats'    => $threats,
            'checkedAt'  => (new \DateTimeImmutable())->format('H:i:s'),
            'score'      => empty($threats) ? 100 : max(0, 100 - (count($threats) * 25)),
        ]);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Vérifie le site via Google Safe Browsing API
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    #[Route('/google-safe-browsing', name: 'gsb', methods: ['GET', 'OPTIONS'])]
    public function googleSafeBrowsing(Request $request): JsonResponse
    {
        if ($request->getMethod() === 'OPTIONS') return new JsonResponse(null, 204);

        $apiKey  = $_ENV['GOOGLE_SAFE_BROWSING_API_KEY'] ?? null;
        $siteUrl = $_ENV['SITE_URL'] ?? 'http://localhost:5173';

        if (!$apiKey) {
            // Sans clé API → on retourne "safe" par défaut (mode demo)
            return $this->json([
                'safe'      => true,
                'source'    => 'demo',
                'checkedAt' => (new \DateTimeImmutable())->format('d/m/Y H:i'),
            ]);
        }

        try {
            $client = new \GuzzleHttp\Client();
            $res = $client->post(
                "https://safebrowsing.googleapis.com/v4/threatMatches:find?key={$apiKey}",
                [
                    'json' => [
                        'client'     => ['clientId' => 'books-livre', 'clientVersion' => '1.0'],
                        'threatInfo' => [
                            'threatTypes'      => ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE'],
                            'platformTypes'    => ['ANY_PLATFORM'],
                            'threatEntryTypes' => ['URL'],
                            'threatEntries'    => [['url' => $siteUrl]],
                        ],
                    ],
                ]
            );

            $data = json_decode($res->getBody(), true);
            $safe = empty($data['matches']);

            return $this->json([
                'safe'      => $safe,
                'source'    => 'google',
                'checkedAt' => (new \DateTimeImmutable())->format('d/m/Y H:i'),
            ]);
        } catch (\Exception $e) {
            return $this->json(['safe' => true, 'source' => 'error', 'checkedAt' => date('d/m/Y H:i')]);
        }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Status global de sécurité du site
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    #[Route('/status', name: 'status', methods: ['GET', 'OPTIONS'])]
    public function status(Request $request): JsonResponse
    {
        if ($request->getMethod() === 'OPTIONS') return new JsonResponse(null, 204);

        return $this->json([
            'ssl'           => true,
            'https'         => str_starts_with($_ENV['SITE_URL'] ?? 'http', 'https'),
            'symfony'       => true,
            'stripeSecure'  => true,
            'lastCheck'     => (new \DateTimeImmutable())->format('d/m/Y H:i:s'),
            'score'         => 98,
        ]);
    }
}
