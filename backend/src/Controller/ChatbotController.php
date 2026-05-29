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

    public function __construct(HttpClientInterface $httpClient)
    {
        $this->httpClient = $httpClient;
    }

    #[Route('/api/chatbot', name: 'api_chatbot', methods: ['POST'])]
    public function askMistral(Request $request, SiteContentRepository $contentRepo): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $userMessage = $data['message'] ?? '';

        if (empty($userMessage)) {
            return new JsonResponse(['error' => 'Message vide'], 400);
        }

        // Je récupère les instructions dynamiques depuis la base de données
        $content = $contentRepo->findOneBy(['identifier' => 'chatbot_prompt']);

        // J'utilise le texte de la base ou un fallback si la ligne n'existe pas encore
        $systemPrompt = $content ? $content->getTextContent() : "Tu es l'assistant de SBH.";

        $apiUrl = 'https://router.huggingface.co/v1/chat/completions';
        $apiToken = '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';

        try {
            $response = $this->httpClient->request('POST', $apiUrl, [
                'verify_peer' => false,
                'verify_host' => false,
                'headers' => [
                    'Authorization' => 'Bearer ' . $apiToken,
                    'Content-Type' => 'application/json',
                ],
                'json' => [
                    'model' => 'Qwen/Qwen2.5-7B-Instruct',
                    'messages' => [
                        [
                            'role' => 'system',
                            'content' => $systemPrompt
                        ],
                        [
                            'role' => 'user',
                            'content' => $userMessage
                        ]
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
            return new JsonResponse(['error' => 'Détails techniques : ' . $e->getMessage()], 500);
        }
    }
}
