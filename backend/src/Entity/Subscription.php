<?php

namespace App\Entity;

use App\Repository\SubscriptionRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: SubscriptionRepository::class)]
#[ORM\Table(name: 'subscription')]
class Subscription
{
    const STATUS_ACTIVE    = 'active';
    const STATUS_CANCELLED = 'cancelled';
    const STATUS_EXPIRED   = 'expired';
    const TRIAL_DAYS       = 7;

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

    #[ORM\Column(length: 20)]
    private string $billingPeriod = 'mensuel';

    #[ORM\Column(type: 'decimal', precision: 10, scale: 2)]
    private string $priceSnapshot;

    #[ORM\Column]
    private int $quantity = 1;

    #[ORM\Column]
    private \DateTimeImmutable $startsAt;

    #[ORM\Column]
    private \DateTimeImmutable $endsAt;

    #[ORM\Column(length: 20)]
    private string $status = self::STATUS_ACTIVE;

    #[ORM\Column]
    private bool $autoRenew = true;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $cancelledAt = null;

    #[ORM\Column]
    private bool $trialCancellation = false;

    #[ORM\ManyToOne(targetEntity: Order::class)]
    #[ORM\JoinColumn(nullable: true)]
    private ?Order $originOrder = null;

    public function __construct()
    {
        $this->startsAt = new \DateTimeImmutable();
    }

    public function computeEndsAt(): void
    {
        $this->endsAt = $this->billingPeriod === 'annuel'
            ? $this->startsAt->modify('+1 year')
            : $this->startsAt->modify('+1 month');
    }

    public function renew(): void
    {
        $this->startsAt          = $this->endsAt;
        $this->endsAt            = $this->billingPeriod === 'annuel'
            ? $this->endsAt->modify('+1 year')
            : $this->endsAt->modify('+1 month');
        $this->status            = self::STATUS_ACTIVE;
        $this->cancelledAt       = null;
        $this->trialCancellation = false;
    }

    public function cancel(): array
    {
        $now      = new \DateTimeImmutable();
        $trialEnd = $this->startsAt->modify('+' . self::TRIAL_DAYS . ' days');
        $inTrial  = $now <= $trialEnd;

        $this->cancelledAt = $now;
        $this->autoRenew   = false;
        $this->status      = self::STATUS_CANCELLED;

        if ($inTrial) {
            $this->endsAt            = $now;
            $this->trialCancellation = true;
            return [
                'type'    => 'trial',
                'endsAt'  => $this->endsAt,
                'message' => "Abonnement annulé pendant la période d'essai. Accès immédiatement révoqué.",
            ];
        }

        $this->trialCancellation = false;
        $label = $this->billingPeriod === 'annuel' ? "fin de l'année" : 'fin du mois';

        return [
            'type'    => 'end_of_period',
            'endsAt'  => $this->endsAt,
            'message' => sprintf("Abonnement annulé. Accès maintenu jusqu'à la %s (%s).", $label, $this->endsAt->format('d/m/Y')),
        ];
    }

    public function isAccessible(): bool
    {
        return $this->endsAt > new \DateTimeImmutable();
    }

    public function isInTrial(): bool
    {
        return new \DateTimeImmutable() <= $this->startsAt->modify('+' . self::TRIAL_DAYS . ' days');
    }

    public function toArray(): array
    {
        $now      = new \DateTimeImmutable();
        $trialEnd = $this->startsAt->modify('+' . self::TRIAL_DAYS . ' days');

        return [
            'id'                => $this->id,
            'serviceName'       => $this->serviceSaas?->getName(),
            'serviceImage'      => $this->serviceSaas?->getImage(),
            'billingPeriod'     => $this->billingPeriod,
            'price'             => $this->priceSnapshot,
            'quantity'          => $this->quantity,
            'startsAt'          => $this->startsAt->format('d/m/Y'),
            'endsAt'            => $this->endsAt->format('d/m/Y'),
            'status'            => $this->status,
            'autoRenew'         => $this->autoRenew,
            'cancelledAt'       => $this->cancelledAt?->format('d/m/Y'),
            'trialCancellation' => $this->trialCancellation,
            'isAccessible'      => $this->isAccessible(),
            'inTrial'           => $this->status === self::STATUS_ACTIVE && $now <= $trialEnd,
            'trialEndsAt'       => $trialEnd->format('d/m/Y'),
            'trialDaysLeft'     => max(0, (int) $now->diff($trialEnd)->days),
        ];
    }

    public function getId(): ?int { return $this->id; }
    public function getUser(): ?User { return $this->user; }
    public function setUser(?User $u): self { $this->user = $u; return $this; }
    public function getServiceSaas(): ?ServiceSaas { return $this->serviceSaas; }
    public function setServiceSaas(?ServiceSaas $s): self { $this->serviceSaas = $s; return $this; }
    public function getBillingPeriod(): string { return $this->billingPeriod; }
    public function setBillingPeriod(string $p): self { $this->billingPeriod = $p; return $this; }
    public function getPriceSnapshot(): string { return $this->priceSnapshot; }
    public function setPriceSnapshot(string $p): self { $this->priceSnapshot = $p; return $this; }
    public function getQuantity(): int { return $this->quantity; }
    public function setQuantity(int $q): self { $this->quantity = $q; return $this; }
    public function getStartsAt(): \DateTimeImmutable { return $this->startsAt; }
    public function setStartsAt(\DateTimeImmutable $d): self { $this->startsAt = $d; return $this; }
    public function getEndsAt(): \DateTimeImmutable { return $this->endsAt; }
    public function setEndsAt(\DateTimeImmutable $d): self { $this->endsAt = $d; return $this; }
    public function getStatus(): string { return $this->status; }
    public function setStatus(string $s): self { $this->status = $s; return $this; }
    public function isAutoRenew(): bool { return $this->autoRenew; }
    public function setAutoRenew(bool $v): self { $this->autoRenew = $v; return $this; }
    public function getCancelledAt(): ?\DateTimeImmutable { return $this->cancelledAt; }
    public function setCancelledAt(?\DateTimeImmutable $d): self { $this->cancelledAt = $d; return $this; }
    public function getOriginOrder(): ?Order { return $this->originOrder; }
    public function setOriginOrder(?Order $o): self { $this->originOrder = $o; return $this; }
    public function isTrialCancellation(): bool { return $this->trialCancellation; }
}
