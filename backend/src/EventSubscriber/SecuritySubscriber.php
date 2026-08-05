<?php

namespace App\EventSubscriber;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\HttpFoundation\JsonResponse;
use Psr\Log\LoggerInterface;
use Symfony\Component\Cache\Adapter\FilesystemAdapter;
use Symfony\Contracts\Translation\TranslatorInterface;

class SecuritySubscriber implements EventSubscriberInterface
{
    private FilesystemAdapter $cache;
    private LoggerInterface $logger;
    private TranslatorInterface $translator;
    private string $environment;

    private const MAX_REQUESTS_PER_MINUTE  = 60;
    private const MAX_LOGIN_ATTEMPTS       = 5;
    private const LOGIN_BLOCK_DURATION     = 900;
    private const RATE_BLOCK_DURATION      = 60;
    private const SUSPICIOUS_BLOCK         = 3600;

    private const ATTACK_PATTERNS = [
        "/(\\'|\\\"|\\`|--|;|\\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|EXEC|EXECUTE|CAST|CONVERT|CHAR|NCHAR|VARCHAR)\\b)/i",
        "/<script[^>]*>|javascript:|on(error|load|click|mouseover|focus)\\s*=/i",
        "/(\\.\\.\\/|\\.\\.\\\\\\/etc\\/passwd|\\/proc\\/self)/",
        "/(https?:\\/\\/[^\\s]+\\.(php|asp|jsp|sh))/i",
        "/\\x00/",
        "/(;\\s*(ls|cat|wget|curl|bash|sh|python|perl|ruby|nc|netcat)\\s)/i",
    ];

    private const MALICIOUS_AGENTS = [
        'sqlmap', 'nikto', 'nmap', 'masscan', 'zgrab',
        'dirbuster', 'hydra', 'medusa', 'burpsuite',
        'acunetix', 'nessus', 'openvas', 'w3af',
    ];

    public function __construct(
        LoggerInterface $logger,
        TranslatorInterface $translator,
        string $environment
    ) {
        $this->logger = $logger;
        $this->translator = $translator;
        $this->environment = $environment;
        $this->cache  = new FilesystemAdapter('security', 0, sys_get_temp_dir() . '/security_cache');
    }

    public static function getSubscribedEvents(): array
    {
        return [KernelEvents::REQUEST => ['onKernelRequest', 10]];
    }

    public function onKernelRequest(RequestEvent $event): void
    {
        if (!$event->isMainRequest()) return;

        // Désactivé en environnement de développement pour éviter
        // les faux positifs (rate limit trop bas pour du dev actif,
        // whitelist IP 127.0.0.1 ne fonctionnant pas derrière Docker)
        if ($this->environment === 'dev') return;

        $request = $event->getRequest();
        $ip      = $request->getClientIp() ?? 'unknown';
        $path    = $request->getPathInfo();
        $ua      = strtolower($request->headers->get('User-Agent', ''));

        if (in_array($ip, ['127.0.0.1', '::1'])) return;

        if (str_starts_with($path, '/api/security')) return;

        if ($this->isBlocked($ip)) {
            $event->setResponse($this->blockResponse($this->translator->trans('security.ip_blocked', [], 'messages'), 429));
            return;
        }

        foreach (self::MALICIOUS_AGENTS as $agent) {
            if (str_contains($ua, $agent)) {
                $this->blockIp($ip, self::SUSPICIOUS_BLOCK);
                $this->logger->critical("Malicious agent blocked: {$agent} from {$ip}");
                $event->setResponse($this->blockResponse($this->translator->trans('security.access_denied', [], 'messages'), 403));
                return;
            }
        }

        $rateLimitKey = "rate_limit_{$ip}";
        $rateItem     = $this->cache->getItem($rateLimitKey);
        $requests     = $rateItem->isHit() ? (int)$rateItem->get() : 0;

        if ($requests >= self::MAX_REQUESTS_PER_MINUTE) {
            $this->blockIp($ip, self::RATE_BLOCK_DURATION);
            $this->logger->warning("Rate limit exceeded for IP: {$ip}");
            $event->setResponse($this->blockResponse($this->translator->trans('security.rate_limit', [], 'messages'), 429));
            return;
        }

        $rateItem->set($requests + 1)->expiresAfter(60);
        $this->cache->save($rateItem);

        if (str_contains($path, 'login_check') && $request->getMethod() === 'POST') {
            $loginKey  = "login_attempts_{$ip}";
            $loginItem = $this->cache->getItem($loginKey);
            $attempts  = $loginItem->isHit() ? (int)$loginItem->get() : 0;

            if ($attempts >= self::MAX_LOGIN_ATTEMPTS) {
                $this->blockIp($ip, self::LOGIN_BLOCK_DURATION);
                $this->logger->warning("Brute force blocked for IP: {$ip} after {$attempts} attempts");
                $event->setResponse($this->blockResponse(
                    $this->translator->trans('security.brute_force', [], 'messages'), 429
                ));
                return;
            }

            $loginItem->set($attempts + 1)->expiresAfter(self::LOGIN_BLOCK_DURATION);
            $this->cache->save($loginItem);
        }

        $toScan = urldecode($request->getRequestUri());
        if ($request->getContent()) {
            $toScan .= ' ' . $request->getContent();
        }

        foreach (self::ATTACK_PATTERNS as $pattern) {
            if (preg_match($pattern, $toScan)) {
                $this->blockIp($ip, self::SUSPICIOUS_BLOCK);
                $this->logger->critical("Attack pattern detected from {$ip}: {$pattern}");
                $event->setResponse($this->blockResponse($this->translator->trans('security.suspicious_request', [], 'messages'), 403));
                return;
            }
        }
    }

    private function isBlocked(string $ip): bool
    {
        $item = $this->cache->getItem("blocked_{$ip}");
        return $item->isHit();
    }

    private function blockIp(string $ip, int $duration): void
    {
        $item = $this->cache->getItem("blocked_{$ip}");
        $item->set(true)->expiresAfter($duration);
        $this->cache->save($item);
    }

    private function blockResponse(string $message, int $code): JsonResponse
    {
        return new JsonResponse([
            'error'   => $message,
            'blocked' => true,
            'retryIn' => $this->translator->trans('security.retry_later', [], 'messages'),
        ], $code);
    }
}
