<?php

namespace App\EventSubscriber;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\ResponseEvent;
use Symfony\Component\HttpKernel\KernelEvents;

class SecurityHeadersSubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return [KernelEvents::RESPONSE => 'onKernelResponse'];
    }

    public function onKernelResponse(ResponseEvent $event): void
    {
        if (!$event->isMainRequest()) return;

        $response = $event->getResponse();

        // ── Headers de sécurité HTTP ──
        // Empêche le clickjacking
        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');

        // Empêche le sniffing MIME
        $response->headers->set('X-Content-Type-Options', 'nosniff');

        // Active le filtre XSS du navigateur
        $response->headers->set('X-XSS-Protection', '1; mode=block');

        // Force HTTPS
        $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

        // Politique de référent
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');

        // Permissions API
        $response->headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(self)');

        // Content Security Policy
        $response->headers->set('Content-Security-Policy',
            "default-src 'self'; " .
            "script-src 'self' 'unsafe-inline' https://js.stripe.com https://www.paypal.com; " .
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " .
            "font-src 'self' https://fonts.gstatic.com; " .
            "img-src 'self' data: https: blob:; " .
            "connect-src 'self' https://api.stripe.com https://openlibrary.org https://covers.openlibrary.org https://safebrowsing.googleapis.com; " .
            "frame-src https://js.stripe.com https://www.paypal.com;"
        );
    }
}