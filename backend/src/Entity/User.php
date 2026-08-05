<?php

namespace App\Entity;

use App\Repository\UserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\Table(name: '`user`')]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 180, unique: true)]
    private ?string $email = null;

    #[ORM\Column(length: 6, nullable: true)]
    private ?string $twoFactorCode = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $twoFactorCodeExpiresAt = null;

    #[ORM\Column]
    private ?string $password = null;

    #[ORM\Column(length: 255)]
    private ?string $nom = null;

    #[ORM\Column(length: 255)]
    private ?string $prenom = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $avatar = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $stripeCustomerId = null;

    #[ORM\Column(type: 'json')]
    private array $roles = [];

    #[ORM\Column(type: 'boolean')]
    private bool $isVerified = false;

    #[ORM\Column(type: 'boolean')]
    private bool $newsletter = false;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $confirmationToken = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $resetToken = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $resetTokenExpiresAt = null;

    #[ORM\OneToMany(mappedBy: 'user', targetEntity: CartItem::class, orphanRemoval: true)]
    private Collection $cartItems;

    #[ORM\OneToMany(mappedBy: 'user', targetEntity: Address::class, orphanRemoval: true, cascade: ['persist', 'remove'])]
    private Collection $addresses;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $lastNewsletterSentAt = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $unsubscribeToken = null;

    public function __construct()
    {
        $this->cartItems = new ArrayCollection();
        $this->addresses = new ArrayCollection();
    }

    public function getId(): ?int { return $this->id; }

    public function getEmail(): ?string { return $this->email; }
    public function setEmail(string $email): self { $this->email = $email; return $this; }

    public function getUserIdentifier(): string { return (string) $this->email; }

    public function getRoles(): array
    {
        $roles = $this->roles;
        $roles[] = 'ROLE_USER';
        return array_unique($roles);
    }

    public function setRoles(array $roles): static
    {
        $this->roles = $roles;
        return $this;
    }

    public function getPassword(): ?string { return $this->password; }
    public function setPassword(string $password): self { $this->password = $password; return $this; }

    public function eraseCredentials(): void {}

    public function getNom(): ?string { return $this->nom; }
    public function setNom(string $nom): self { $this->nom = $nom; return $this; }

    public function getPrenom(): ?string { return $this->prenom; }
    public function setPrenom(string $prenom): self { $this->prenom = $prenom; return $this; }

    public function getAvatar(): ?string { return $this->avatar; }
    public function setAvatar(?string $avatar): self { $this->avatar = $avatar; return $this; }

    public function getStripeCustomerId(): ?string { return $this->stripeCustomerId; }
    public function setStripeCustomerId(?string $stripeCustomerId): self { $this->stripeCustomerId = $stripeCustomerId; return $this; }

    public function isVerified(): bool { return $this->isVerified; }
    public function setIsVerified(bool $isVerified): self { $this->isVerified = $isVerified; return $this; }

    public function isNewsletter(): bool { return $this->newsletter; }
    public function setNewsletter(bool $newsletter): self { $this->newsletter = $newsletter; return $this; }

    public function getConfirmationToken(): ?string { return $this->confirmationToken; }
    public function setConfirmationToken(?string $confirmationToken): self { $this->confirmationToken = $confirmationToken; return $this; }

    public function getResetToken(): ?string { return $this->resetToken; }
    public function setResetToken(?string $resetToken): static { $this->resetToken = $resetToken; return $this; }

    public function getResetTokenExpiresAt(): ?\DateTimeImmutable { return $this->resetTokenExpiresAt; }
    public function setResetTokenExpiresAt(?\DateTimeImmutable $resetTokenExpiresAt): static { $this->resetTokenExpiresAt = $resetTokenExpiresAt; return $this; }

    public function getTwoFactorCode(): ?string { return $this->twoFactorCode; }
    public function setTwoFactorCode(?string $twoFactorCode): self { $this->twoFactorCode = $twoFactorCode; return $this; }

    public function getTwoFactorCodeExpiresAt(): ?\DateTimeImmutable { return $this->twoFactorCodeExpiresAt; }
    public function setTwoFactorCodeExpiresAt(?\DateTimeImmutable $twoFactorCodeExpiresAt): self { $this->twoFactorCodeExpiresAt = $twoFactorCodeExpiresAt; return $this; }

    public function getCartItems(): Collection { return $this->cartItems; }

    public function addCartItem(CartItem $cartItem): self
    {
        if (!$this->cartItems->contains($cartItem)) {
            $this->cartItems[] = $cartItem;
            $cartItem->setUser($this);
        }
        return $this;
    }

    public function removeCartItem(CartItem $cartItem): self
    {
        if ($this->cartItems->removeElement($cartItem)) {
            if ($cartItem->getUser() === $this) {
                $cartItem->setUser(null);
            }
        }
        return $this;
    }

    public function getAddresses(): Collection { return $this->addresses; }

    public function addAddress(Address $address): self
    {
        if (!$this->addresses->contains($address)) {
            $this->addresses->add($address);
            $address->setUser($this);
        }
        return $this;
    }

    public function removeAddress(Address $address): self
    {
        if ($this->addresses->removeElement($address)) {
            if ($address->getUser() === $this) {
                $address->setUser(null);
            }
        }
        return $this;
    }

    public function getLastNewsletterSentAt(): ?\DateTimeImmutable
    {
        return $this->lastNewsletterSentAt;
    }

    public function setLastNewsletterSentAt(?\DateTimeImmutable $lastNewsletterSentAt): static
    {
        $this->lastNewsletterSentAt = $lastNewsletterSentAt;

        return $this;
    }

    public function getUnsubscribeToken(): ?string
    {
        return $this->unsubscribeToken;
    }

    public function setUnsubscribeToken(?string $unsubscribeToken): static
    {
        $this->unsubscribeToken = $unsubscribeToken;

        return $this;
    }
}
