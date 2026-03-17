<?php

namespace App\Repository;

use App\Entity\ServiceSaas;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<ServiceSaas>
 */
class ServiceSaasRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ServiceSaas::class);
    }

    // J'ajoute cette requête pour trier les produits par priorité puis par disponibilité.
    public function findCatalogServices(): array
    {
        return $this->createQueryBuilder('s')
            ->orderBy('s.priority', 'DESC')
            ->addOrderBy('s.isAvailable', 'DESC')
            ->getQuery()
            ->getResult();
    }
}
