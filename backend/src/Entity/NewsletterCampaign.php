<?php

namespace App\Entity;

use App\Repository\NewsletterCampaignRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: NewsletterCampaignRepository::class)]
class NewsletterCampaign
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $subject = null;

    #[ORM\Column(type: Types::TEXT)]
    private ?string $content = null;

    #[ORM\Column(length: 50)]
    private ?string $status = 'draft';

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $scheduledAt = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $sentAt = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $createdAt = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int { return $this->id; }

    public function getSubject(): ?string { return $this->subject; }
    public function setSubject(string $subject): self { $this->subject = $subject; return $this; }

    public function getContent(): ?string { return $this->content; }
    public function setContent(string $content): self { $this->content = $content; return $this; }

    public function getStatus(): ?string { return $this->status; }
    public function setStatus(string $status): self { $this->status = $status; return $this; }

    public function getScheduledAt(): ?\DateTimeImmutable { return $this->scheduledAt; }
    public function setScheduledAt(?\DateTimeImmutable $scheduledAt): self { $this->scheduledAt = $scheduledAt; return $this; }

    public function getSentAt(): ?\DateTimeImmutable { return $this->sentAt; }
    public function setSentAt(?\DateTimeImmutable $sentAt): self { $this->sentAt = $sentAt; return $this; }

    public function getCreatedAt(): ?\DateTimeImmutable { return $this->createdAt; }
}
