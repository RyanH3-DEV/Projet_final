<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Contracts\Translation\TranslatorInterface;

#[Route('/api/paiement', name: 'api_paiement_')]
class PaiementController extends AbstractController
{
    private TranslatorInterface $translator;

    public function __construct(TranslatorInterface $translator)
    {
        $this->translator = $translator;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // STRIPE — Créer un PaymentIntent (3D Secure auto)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    #[Route('/stripe/intent', name: 'stripe_intent', methods: ['POST', 'OPTIONS'])]
    public function stripeIntent(Request $request): JsonResponse
    {
        if ($request->getMethod() === 'OPTIONS') {
            return new JsonResponse(null, 204);
        }

        $payload  = json_decode($request->getContent(), true);
        $amount   = (int)($payload['amount'] ?? 0);
        $currency = $payload['currency'] ?? 'eur';
        $email    = $payload['email'] ?? null;

        if ($amount <= 0) {
            return $this->json(['message' => $this->translator->trans('payment.invalid_amount', [], 'messages')], 400);
        }

        \Stripe\Stripe::setApiKey($_ENV['STRIPE_SECRET_KEY']);

        try {
            $intent = \Stripe\PaymentIntent::create([
                'amount'               => $amount,
                'currency'             => $currency,
                'receipt_email'        => $email,
                'payment_method_types' => ['card'],
            ]);
            return $this->json(['clientSecret' => $intent->client_secret]);
        } catch (\Stripe\Exception\ApiErrorException $e) {
            return $this->json(['message' => $e->getMessage()], 500);
        }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // PAYPAL — Créer une commande
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    #[Route('/paypal/create', name: 'paypal_create', methods: ['POST', 'OPTIONS'])]
    public function paypalCreate(Request $request): JsonResponse
    {
        if ($request->getMethod() === 'OPTIONS') {
            return new JsonResponse(null, 204);
        }

        $payload = json_decode($request->getContent(), true);
        $amount  = number_format((float)($payload['amount'] ?? 0), 2, '.', '');

        if ((float)$amount <= 0) {
            return $this->json(['message' => $this->translator->trans('payment.invalid_amount', [], 'messages')], 400);
        }

        try {
            $accessToken = $this->getPaypalAccessToken();

            if (!$accessToken) {
                return $this->json(['message' => $this->translator->trans('payment.paypal_token_error', [], 'messages')], 500);
            }

            $baseUrl  = $this->getPaypalBaseUrl();
            $response = $this->paypalRequest('POST', "$baseUrl/v2/checkout/orders", $accessToken, [
                'intent'         => 'CAPTURE',
                'purchase_units' => [[
                    'amount' => [
                        'currency_code' => 'EUR',
                        'value'         => $amount,
                    ],
                ]],
            ]);

            if (!isset($response['id'])) {
                return $this->json([
                    'message' => $this->translator->trans('payment.paypal_no_order_id', [], 'messages'),
                    'debug'   => $response
                ], 500);
            }

            return $this->json(['orderID' => $response['id']]);

        } catch (\Exception $e) {
            return $this->json(['message' => $e->getMessage()], 500);
        }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // PAYPAL — Capturer le paiement
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    #[Route('/paypal/capture', name: 'paypal_capture', methods: ['POST', 'OPTIONS'])]
    public function paypalCapture(Request $request): JsonResponse
    {
        if ($request->getMethod() === 'OPTIONS') {
            return new JsonResponse(null, 204);
        }

        $payload = json_decode($request->getContent(), true);
        $orderID = $payload['orderID'] ?? null;

        if (!$orderID) {
            return $this->json(['message' => $this->translator->trans('payment.missing_order_id', [], 'messages')], 400);
        }

        try {
            $accessToken = $this->getPaypalAccessToken();
            $baseUrl     = $this->getPaypalBaseUrl();
            $response    = $this->paypalRequest('POST', "$baseUrl/v2/checkout/orders/$orderID/capture", $accessToken, []);

            return $this->json(['status' => $response['status'] ?? 'UNKNOWN']);

        } catch (\Exception $e) {
            return $this->json(['message' => $e->getMessage()], 500);
        }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // HELPERS PRIVÉS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    private function getPaypalBaseUrl(): string
    {
        $isSandbox = ($_ENV['PAYPAL_ENV'] ?? 'sandbox') !== 'production';
        return $isSandbox
            ? 'https://api-m.sandbox.paypal.com'
            : 'https://api-m.paypal.com';
    }

    private function getPaypalAccessToken(): string
    {
        $isSandbox    = ($_ENV['PAYPAL_ENV'] ?? 'sandbox') !== 'production';
        $baseUrl      = $this->getPaypalBaseUrl();
        $clientId     = $isSandbox
            ? ($_ENV['PAYPAL_SANDBOX_CLIENT_ID'] ?? '')
            : ($_ENV['PAYPAL_LIVE_CLIENT_ID'] ?? '');
        $clientSecret = $isSandbox
            ? ($_ENV['PAYPAL_SANDBOX_SECRET'] ?? '')
            : ($_ENV['PAYPAL_LIVE_SECRET'] ?? '');

        if (!$clientId || !$clientSecret) {
            throw new \Exception($this->translator->trans('payment.missing_keys', [], 'messages'));
        }

        $ch = curl_init("$baseUrl/v1/oauth2/token");

        // J'ai désactivé la vérification SSL ici pour le développement local
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_USERPWD        => "$clientId:$clientSecret",
            CURLOPT_POSTFIELDS     => 'grant_type=client_credentials',
            CURLOPT_HTTPHEADER     => ['Content-Type: application/x-www-form-urlencoded'],
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => false,
        ]);

        $result = json_decode(curl_exec($ch), true);
        $error  = curl_error($ch);
        curl_close($ch);

        if ($error) {
            throw new \Exception($this->translator->trans('payment.curl_error', ['%error%' => $error], 'messages'));
        }

        if (!isset($result['access_token'])) {
            throw new \Exception('Token PayPal non reçu : ' . json_encode($result));
        }

        return $result['access_token'];
    }

    private function paypalRequest(string $method, string $url, string $token, array $body): array
    {
        $ch = curl_init($url);

        // J'ai également désactivé la vérification SSL ici pour le développement local
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CUSTOMREQUEST  => $method,
            CURLOPT_POSTFIELDS     => json_encode($body),
            CURLOPT_HTTPHEADER     => [
                "Authorization: Bearer $token",
                'Content-Type: application/json',
            ],
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => false,
        ]);

        $result = json_decode(curl_exec($ch), true);
        $error  = curl_error($ch);
        curl_close($ch);

        if ($error) {
            throw new \Exception($this->translator->trans('payment.curl_error', ['%error%' => $error], 'messages'));
        }

        return $result ?? [];
    }
}
