<?php

namespace App\Entity;

use App\Repository\WishlistRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: WishlistRepository::class)]
#[ORM\Table(name: 'wishlist')]
#[ORM\UniqueConstraint(name: 'unique_wishlist', columns: ['user_id', 'service_saas_id'])]
class Wishlist
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $user = null;

    #[ORM\ManyToOne(targetEntity: ServiceSaas::class)]
    #[ORM\JoinColumn(nullable: false)]
    private ?ServiceSaas $serviceSaas = null;

    #[ORM\Column]
    private \DateTimeImmutable $addedAt;

    public function __construct()
    {
        $this->addedAt = new \DateTimeImmutable();
    }

    public function getId(): ?int { return $this->id; }
    public function getUser(): ?User { return $this->user; }
    public function setUser(?User $user): self { $this->user = $user; return $this; }
    public function getServiceSaas(): ?ServiceSaas { return $this->serviceSaas; }
    public function setServiceSaas(?ServiceSaas $serviceSaas): self { $this->serviceSaas = $serviceSaas; return $this; }
    public function getAddedAt(): \DateTimeImmutable { return $this->addedAt; }
}
