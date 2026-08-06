<?php

namespace App\Controller\Api;

use App\Repository\SiteContentRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

class SiteContentController extends AbstractController
{
    #[Route('/api/site-contents', name: 'api_site_contents', methods: ['GET'])]
    public function index(SiteContentRepository $repository): JsonResponse
    {
        $contents = $repository->findAll();

        $data = [];
        foreach ($contents as $content) {
            $data[$content->getIdentifier()] = [
                'type' => $content->getContentType(),
                'text' => $content->getTextContent(),
                'image' => $content->getImagePath()
                    ? $content->getImagePath()
                    : null,
            ];
        }

        return $this->json($data);
    }
}
