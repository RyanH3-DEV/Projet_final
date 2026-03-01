<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/paiement', name: 'api_paiement_')]
class PaiementController extends AbstractController
{
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
            return $this->json(['message' => 'Montant invalide'], 400);
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
            return $this->json(['message' => 'Montant invalide'], 400);
        }

        try {
            $accessToken = $this->getPaypalAccessToken();

            if (!$accessToken) {
                return $this->json(['message' => 'Impossible d\'obtenir le token PayPal. Vérifiez vos clés.'], 500);
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
                    'message' => 'PayPal n\'a pas retourné d\'ID de commande.',
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
            return $this->json(['message' => 'orderID manquant'], 400);
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
            throw new \Exception('Clés PayPal manquantes dans le .env');
        }

        $ch = curl_init("$baseUrl/v1/oauth2/token");
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_USERPWD        => "$clientId:$clientSecret",
            CURLOPT_POSTFIELDS     => 'grant_type=client_credentials',
            CURLOPT_HTTPHEADER     => ['Content-Type: application/x-www-form-urlencoded'],
            CURLOPT_SSL_VERIFYPEER => true,
        ]);

        $result = json_decode(curl_exec($ch), true);
        $error  = curl_error($ch);
        curl_close($ch);

        if ($error) {
            throw new \Exception("Erreur cURL PayPal : $error");
        }

        if (!isset($result['access_token'])) {
            throw new \Exception('Token PayPal non reçu : ' . json_encode($result));
        }

        return $result['access_token'];
    }

    private function paypalRequest(string $method, string $url, string $token, array $body): array
    {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CUSTOMREQUEST  => $method,
            CURLOPT_POSTFIELDS     => json_encode($body),
            CURLOPT_HTTPHEADER     => [
                "Authorization: Bearer $token",
                'Content-Type: application/json',
            ],
            CURLOPT_SSL_VERIFYPEER => true,
        ]);

        $result = json_decode(curl_exec($ch), true);
        $error  = curl_error($ch);
        curl_close($ch);

        if ($error) {
            throw new \Exception("Erreur cURL PayPal : $error");
        }

        return $result ?? [];
    }
}
