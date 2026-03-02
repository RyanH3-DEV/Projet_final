<?php

namespace App\Controller;

use App\Entity\Order;
use App\Entity\OrderItem;
use App\Entity\Wishlist;
use App\Entity\Livre;
use App\Entity\User;
use App\Entity\CartItem;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/profil', name: 'api_profil_')]
class ProfilController extends AbstractController
{
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // HISTORIQUE DES COMMANDES
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    #[Route('/commandes', name: 'commandes', methods: ['GET', 'OPTIONS'])]
    public function commandes(Request $request, EntityManagerInterface $em): JsonResponse
    {
        if ($request->getMethod() === 'OPTIONS') return new JsonResponse(null, 204);

        $email = $request->query->get('email');
        $user  = $em->getRepository(User::class)->findOneBy(['email' => $email]);
        if (!$user) return $this->json(['message' => 'Utilisateur non trouvé'], 404);

        $orders = $em->getRepository(Order::class)->findBy(
            ['user' => $user],
            ['createdAt' => 'DESC']
        );

        $data = array_map(fn($order) => [
            'id'            => $order->getId(),
            'date'          => $order->getCreatedAt()->format('d/m/Y'),
            'total'         => $order->getTotal(),
            'status'        => $order->getStatus(),
            'paymentMethod' => $order->getPaymentMethod(),
            'items'         => array_map(fn($item) => [
                'title'    => $item->getTitle(),
                'price'    => $item->getPrice(),
                'quantity' => $item->getQuantity(),
                'image'    => $item->getImage(),
            ], $order->getItems()->toArray()),
        ], $orders);

        return $this->json(['orders' => $data]);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // CRÉER UNE COMMANDE (appelé après paiement réussi)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    #[Route('/commandes/creer', name: 'commandes_creer', methods: ['POST', 'OPTIONS'])]
    public function creerCommande(Request $request, EntityManagerInterface $em): JsonResponse
    {
        if ($request->getMethod() === 'OPTIONS') return new JsonResponse(null, 204);

        $payload = json_decode($request->getContent(), true);
        $email   = $payload['email'] ?? null;
        $user    = $em->getRepository(User::class)->findOneBy(['email' => $email]);

        if (!$user) return $this->json(['message' => 'Utilisateur non trouvé'], 404);

        // Récupère les articles du panier
        $cartItems = $em->getRepository(CartItem::class)->findBy(['user' => $user]);
        if (empty($cartItems)) return $this->json(['message' => 'Panier vide'], 400);

        $total = 0;
        $order = new Order();
        $order->setUser($user);
        $order->setPaymentMethod($payload['paymentMethod'] ?? 'card');

        foreach ($cartItems as $cartItem) {
            $item = new OrderItem();
            $item->setTitle($cartItem->getLivre()->getTitle());
            $item->setPrice($cartItem->getLivre()->getPrice());
            $item->setQuantity($cartItem->getQuantity());
            $item->setImage($cartItem->getLivre()->getImage());
            $order->addItem($item);
            $em->persist($item);
            $total += $cartItem->getLivre()->getPrice() * $cartItem->getQuantity();

            // Vide le panier après commande
            $em->remove($cartItem);
        }

        $order->setTotal(number_format($total, 2, '.', ''));
        $em->persist($order);
        $em->flush();

        return $this->json(['message' => 'Commande créée', 'orderId' => $order->getId()], 201);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // WISHLIST — Récupérer
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    #[Route('/wishlist', name: 'wishlist_get', methods: ['GET', 'OPTIONS'])]
    public function getWishlist(Request $request, EntityManagerInterface $em): JsonResponse
    {
        if ($request->getMethod() === 'OPTIONS') return new JsonResponse(null, 204);

        $email = $request->query->get('email');
        $user  = $em->getRepository(User::class)->findOneBy(['email' => $email]);
        if (!$user) return $this->json(['message' => 'Utilisateur non trouvé'], 404);

        $items = $em->getRepository(Wishlist::class)->findBy(['user' => $user]);

        $data = array_map(fn($w) => [
            'id'    => $w->getId(),
            'title' => $w->getLivre()->getTitle(),
            'price' => $w->getLivre()->getPrice(),
            'image' => $w->getLivre()->getImage(),
        ], $items);

        return $this->json(['items' => $data]);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // WISHLIST — Ajouter
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    #[Route('/wishlist/add', name: 'wishlist_add', methods: ['POST', 'OPTIONS'])]
    public function addWishlist(Request $request, EntityManagerInterface $em): JsonResponse
    {
        if ($request->getMethod() === 'OPTIONS') return new JsonResponse(null, 204);

        $payload = json_decode($request->getContent(), true);
        $email   = $payload['email'] ?? null;
        $user    = $em->getRepository(User::class)->findOneBy(['email' => $email]);
        if (!$user) return $this->json(['message' => 'Utilisateur non trouvé'], 404);

        $livre = $em->getRepository(Livre::class)->findOneBy(['title' => $payload['title']]);
        if (!$livre) {
            $livre = new Livre();
            $livre->setTitle($payload['title']);
            $livre->setPrice((float)($payload['price'] ?? 0));
            $livre->setImage($payload['image'] ?? '');
            $em->persist($livre);
            $em->flush();
        }

        // Vérifie qu'il n'est pas déjà en wishlist
        $existing = $em->getRepository(Wishlist::class)->findOneBy(['user' => $user, 'livre' => $livre]);
        if ($existing) return $this->json(['message' => 'Déjà dans la wishlist'], 200);

        $wishlist = new Wishlist();
        $wishlist->setUser($user);
        $wishlist->setLivre($livre);
        $em->persist($wishlist);
        $em->flush();

        return $this->json(['message' => 'Ajouté à la wishlist'], 201);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // WISHLIST — Supprimer
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    #[Route('/wishlist/remove/{id}', name: 'wishlist_remove', methods: ['DELETE', 'OPTIONS'])]
    public function removeWishlist(int $id, Request $request, EntityManagerInterface $em): JsonResponse
    {
        if ($request->getMethod() === 'OPTIONS') return new JsonResponse(null, 204);

        $email = $request->query->get('email');
        $user  = $em->getRepository(User::class)->findOneBy(['email' => $email]);
        $item  = $em->getRepository(Wishlist::class)->findOneBy(['id' => $id, 'user' => $user]);

        if (!$item) return $this->json(['message' => 'Article non trouvé'], 404);

        $em->remove($item);
        $em->flush();

        return $this->json(['message' => 'Retiré de la wishlist']);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // INFORMATIONS PERSONNELLES — Modifier
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    #[Route('/modifier', name: 'modifier', methods: ['PUT', 'OPTIONS'])]
    public function modifier(
        Request $request,
        EntityManagerInterface $em,
        UserPasswordHasherInterface $hasher
    ): JsonResponse {
        if ($request->getMethod() === 'OPTIONS') return new JsonResponse(null, 204);

        $payload = json_decode($request->getContent(), true);
        $email   = $payload['email'] ?? null;
        $user    = $em->getRepository(User::class)->findOneBy(['email' => $email]);

        if (!$user) return $this->json(['message' => 'Utilisateur non trouvé'], 404);

        if (!empty($payload['prenom'])) $user->setPrenom($payload['prenom']);
        if (!empty($payload['nom']))    $user->setNom($payload['nom']);
        if (!empty($payload['avatar'])) $user->setAvatar($payload['avatar']);

        // Changement de mot de passe optionnel
        if (!empty($payload['newPassword'])) {
            if (empty($payload['currentPassword']) || !$hasher->isPasswordValid($user, $payload['currentPassword'])) {
                return $this->json(['message' => 'Mot de passe actuel incorrect'], 400);
            }
            $user->setPassword($hasher->hashPassword($user, $payload['newPassword']));
        }

        $em->flush();

        return $this->json([
            'message' => 'Profil mis à jour',
            'user'    => [
                'email'  => $user->getEmail(),
                'prenom' => $user->getPrenom(),
                'nom'    => $user->getNom(),
                'avatar' => $user->getAvatar(),
            ]
        ]);
    }
}
