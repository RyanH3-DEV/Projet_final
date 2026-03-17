<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
class CartItem
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
    private ?int $quantity = null;

    #[ORM\Column(length: 50)]
    private ?string $subscriptionDuration = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): static
    {
        $this->user = $user;
        return $this;
    }

    public function getServiceSaas(): ?ServiceSaas
    {
        return $this->serviceSaas;
    }

    public function setServiceSaas(?ServiceSaas $serviceSaas): static
    {
        $this->serviceSaas = $serviceSaas;
        return $this;
    }

    public function getQuantity(): ?int
    {
        return $this->quantity;
    }

    public function setQuantity(int $quantity): static
    {
        $this->quantity = $quantity;
        return $this;
    }

    public function getSubscriptionDuration(): ?string
    {
        return $this->subscriptionDuration;
    }

    public function setSubscriptionDuration(string $subscriptionDuration): static
    {
        $this->subscriptionDuration = $subscriptionDuration;
        return $this;
    }
}
