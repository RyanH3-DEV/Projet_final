<?php

namespace App\Entity;

use App\Repository\PageViewRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: PageViewRepository::class)]
#[ORM\Table(name: "page_view")]
class PageView
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private string $page = "";

    #[ORM\Column(length: 50, nullable: true)]
    private ?string $browser = null;

    #[ORM\Column(length: 50, nullable: true)]
    private ?string $os = null;

    #[ORM\Column(length: 100, nullable: true)]
    private ?string $country = null;

    #[ORM\Column(length: 50, nullable: true)]
    private ?string $ip = null;

    #[ORM\Column]
    private \DateTimeImmutable $visitedAt;

    public function __construct()
    {
        $this->visitedAt = new \DateTimeImmutable();
    }

    public function getId(): ?int { return $this->id; }
    public function getPage(): string { return $this->page; }
    public function setPage(string $page): static { $this->page = $page; return $this; }
    public function getBrowser(): ?string { return $this->browser; }
    public function setBrowser(?string $browser): static { $this->browser = $browser; return $this; }
    public function getOs(): ?string { return $this->os; }
    public function setOs(?string $os): static { $this->os = $os; return $this; }
    public function getCountry(): ?string { return $this->country; }
    public function setCountry(?string $country): static { $this->country = $country; return $this; }
    public function getIp(): ?string { return $this->ip; }
    public function setIp(?string $ip): static { $this->ip = $ip; return $this; }
    public function getVisitedAt(): \DateTimeImmutable { return $this->visitedAt; }
}
