<?php

namespace App\Repository;

use App\Entity\NewsletterCampaign;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<NewsletterCampaign>
 */
class NewsletterCampaignRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, NewsletterCampaign::class);
    }

    // J'utilise ce fichier pour écrire mes requêtes personnalisées vers la base de données
    // Pour l'instant, les méthodes par défaut suffisent pour le robot d'envoi
}
