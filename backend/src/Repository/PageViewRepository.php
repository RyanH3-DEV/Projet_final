<?php
namespace App\Repository;
use App\Entity\PageView;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class PageViewRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, PageView::class);
    }

    public function countByPage(): array
    {
        return $this->createQueryBuilder('p')
            ->select('p.page, COUNT(p.id) as total')
            ->groupBy('p.page')
            ->orderBy('total', 'DESC')
            ->setMaxResults(10)
            ->getQuery()->getArrayResult();
    }

    public function countByBrowser(): array
    {
        return $this->createQueryBuilder('p')
            ->select('p.browser, COUNT(p.id) as total')
            ->where('p.browser IS NOT NULL')
            ->groupBy('p.browser')
            ->orderBy('total', 'DESC')
            ->getQuery()->getArrayResult();
    }

    public function countByOs(): array
    {
        return $this->createQueryBuilder('p')
            ->select('p.os, COUNT(p.id) as total')
            ->where('p.os IS NOT NULL')
            ->groupBy('p.os')
            ->orderBy('total', 'DESC')
            ->getQuery()->getArrayResult();
    }

    public function countByDay(int $days = 30): array
    {
        $since = new \DateTimeImmutable("-{$days} days");
        return $this->createQueryBuilder('p')
            ->select('DATE(p.visitedAt) as day, COUNT(p.id) as total')
            ->where('p.visitedAt >= :since')
            ->setParameter('since', $since)
            ->groupBy('day')
            ->orderBy('day', 'ASC')
            ->getQuery()->getArrayResult();
    }

    public function countTotal(): int
    {
        return (int) $this->createQueryBuilder('p')
            ->select('COUNT(p.id)')
            ->getQuery()->getSingleScalarResult();
    }

    public function countToday(): int
    {
        $today = new \DateTimeImmutable('today');
        return (int) $this->createQueryBuilder('p')
            ->select('COUNT(p.id)')
            ->where('p.visitedAt >= :today')
            ->setParameter('today', $today)
            ->getQuery()->getSingleScalarResult();
    }
}
