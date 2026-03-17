<?php

namespace App\Repository;

use App\Entity\Wishlist;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Wishlist>
 */
class WishlistRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        // Je lie explicitement ce repository à l'entité Wishlist
        parent::__construct($registry, Wishlist::class);
    }

    /**
     * Je récupère les favoris d'un utilisateur par son email
     */
    public function findByEmail(string $email): array
    {
        return $this->createQueryBuilder('w')
            ->join('w.user', 'u')
            ->where('u.email = :email')
            ->setParameter('email', $email)
            ->getQuery()
            ->getResult();
    }
}
