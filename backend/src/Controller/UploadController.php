<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class UploadController extends AbstractController
{
    #[Route('/uploads/{type}/{filename}', name: 'serve_upload', methods: ['GET'], requirements: ['type' => 'contents|services'])]
    public function serve(string $type, string $filename): Response
    {
        // Empêche toute tentative de sortir du dossier (ex: ../../.env)
        $filename = basename($filename);

        $path = $this->getParameter('kernel.project_dir') . '/public/uploads/' . $type . '/' . $filename;

        if (!file_exists($path)) {
            return new JsonResponse(['error' => 'Fichier introuvable'], 404);
        }

        $response = new BinaryFileResponse($path);
        $response->headers->set('Cache-Control', 'public, max-age=86400');

        return $response;
    }
}
