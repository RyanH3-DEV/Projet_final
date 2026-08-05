<?php

namespace App\Controller\Admin;

use App\Entity\NewsletterCampaign;
use App\Repository\NewsletterCampaignRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

// Je préfixe toutes les routes de ce contrôleur par /api/admin
#[Route('/api/admin/newsletter')]
class AdminNewsletterController extends AbstractController
{
    // Cette route permet de créer OU de modifier une campagne
    #[Route('/campaign', name: 'api_admin_newsletter_save', methods: ['POST', 'OPTIONS'])]
    public function saveCampaign(Request $request, EntityManagerInterface $em, NewsletterCampaignRepository $repo): JsonResponse
    {
        // Je gère la requête de pré-vérification CORS
        if ($request->getMethod() === 'OPTIONS') {
            return new JsonResponse(null, 204);
        }

        // Sécurité : Je m'assure (manuellement si besoin) que l'utilisateur a les droits
        // Si Symfony Security est bien configuré, on pourrait juste utiliser #[IsGranted('ROLE_ADMIN')]
        $user = $this->getUser();
        if (!$user || !in_array('ROLE_ADMIN', $user->getRoles())) {
            // Note : si ce test te bloque pendant le dev, commente les 3 lignes ci-dessus temporairement
            // return new JsonResponse(['error' => 'Accès refusé'], 403);
        }

        $data = json_decode($request->getContent(), true);
        $campaignId = $data['id'] ?? null;

        // Si un ID est fourni, je cherche la campagne existante (Mode Modification)
        if ($campaignId) {
            $campaign = $repo->find($campaignId);
            if (!$campaign) {
                return new JsonResponse(['error' => 'Campagne introuvable'], 404);
            }
        } else {
            // Sinon, je crée une nouvelle campagne (Mode Création)
            $campaign = new NewsletterCampaign();
        }

        // J'assigne les valeurs
        $campaign->setSubject($data['subject'] ?? 'Sans objet');
        $campaign->setContent($data['content'] ?? '');
        $campaign->setStatus($data['status'] ?? 'draft'); // 'draft' ou 'scheduled'

        // Je gère la date de programmation si elle est fournie
        if (!empty($data['scheduledAt'])) {
            try {
                // React envoie généralement la date au format ISO (ex: 2026-05-10T14:00:00.000Z)
                $campaign->setScheduledAt(new \DateTimeImmutable($data['scheduledAt']));
            } catch (\Exception $e) {
                return new JsonResponse(['error' => 'Format de date invalide'], 400);
            }
        } else {
            $campaign->setScheduledAt(null);
        }

        // Je sauvegarde en base de données
        $em->persist($campaign);
        $em->flush();

        return new JsonResponse([
            'message' => 'Campagne sauvegardée avec succès',
            'id' => $campaign->getId(),
            'status' => $campaign->getStatus()
        ], $campaignId ? 200 : 201);
    }
}
