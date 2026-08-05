<?php

namespace App\Controller;

use App\Repository\SiteContentRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class ChatbotController extends AbstractController
{
    private $httpClient;
    private string $hfToken;
    private string $hfUrl;

    public function __construct(
        HttpClientInterface $httpClient,
        string $hfToken,
        string $hfUrl
    ) {
        $this->httpClient = $httpClient;
        $this->hfToken = $hfToken;
        $this->hfUrl = $hfUrl;
    }

    #[Route('/api/chatbot', name: 'api_chatbot', methods: ['POST'])]
    public function askMistral(Request $request, SiteContentRepository $contentRepo): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $userMessage = $data['message'] ?? '';

        if (empty($userMessage)) {
            return new JsonResponse(['error' => 'Message vide'], 400);
        }

        $content = $contentRepo->findOneBy(['identifier' => 'chatbot_prompt']);
        $systemPrompt = $content ? $content->getTextContent() : "Tu es l'assistant de SBH.";

        try {
            $response = $this->httpClient->request('POST', $this->hfUrl, [
                'timeout' => 15,
                'headers' => [
                    'Authorization' => 'Bearer ' . $this->hfToken,
                    'Content-Type' => 'application/json',
                    'Accept' => 'application/json',
                ],
                'json' => [
                    'model' => 'Qwen/Qwen2.5-7B-Instruct',
                    'messages' => [
                        ['role' => 'system', 'content' => $systemPrompt],
                        ['role' => 'user', 'content' => $userMessage]
                    ],
                    'max_tokens' => 250
                ]
            ]);

            $rawContent = $response->getContent(false);
            $result = json_decode($rawContent, true);

            if (isset($result['error'])) {
                $errorMessage = is_array($result['error']) ? json_encode($result['error']) : $result['error'];
                return new JsonResponse(['error' => 'Erreur HF : ' . $errorMessage], 500);
            }

            $reply = $result['choices'][0]['message']['content'] ?? "Je rencontre une difficulté pour répondre.";

            return new JsonResponse(['reply' => $reply]);

        } catch (\Exception $e) {
            return new JsonResponse(['error' => 'DEBUG: ' . $e->getMessage()], 500);
        }
    }
}
