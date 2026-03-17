<?php

namespace App\Controller;

use App\Entity\Order;
use App\Entity\OrderItem;
use App\Entity\Wishlist;
use App\Entity\ServiceSaas;
use App\Entity\User;
use App\Entity\CartItem;
use App\Entity\Address;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/profil', name: 'api_profil_')]
class ProfilController extends AbstractController
{
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

        // Je mappe les commandes avec les nouvelles propriétés liées aux services SaaS
        $data = array_map(function($order) {
            return [
                'id'             => $order->getId(),
                'date'           => $order->getCreatedAt()->format('d/m/Y'),
                'total'          => $order->getTotal(),
                'status'         => $order->getStatus(),
                'paymentMethod'  => $order->getPaymentMethod(),
                'billingAddress' => $order->getBillingAddress(),
                'invoicePath'    => $order->getInvoicePath(),
                'items'          => array_map(function($item) {
                    return [
                        'serviceName'          => $item->getServiceName(),
                        'price'                => $item->getPrice(),
                        'quantity'             => $item->getQuantity(),
                        'subscriptionDuration' => $item->getSubscriptionDuration(),
                        'image'                => $item->getImage(),
                    ];
                }, $order->getItems()->toArray()),
            ];
        }, $orders);

        return $this->json(['orders' => $data]);
    }

    #[Route('/commandes/creer', name: 'commandes_creer', methods: ['POST', 'OPTIONS'])]
    public function creerCommande(Request $request, EntityManagerInterface $em): JsonResponse
    {
        if ($request->getMethod() === 'OPTIONS') return new JsonResponse(null, 204);

        $payload = json_decode($request->getContent(), true);
        $email   = $payload['email'] ?? null;
        $user    = $em->getRepository(User::class)->findOneBy(['email' => $email]);

        if (!$user) return $this->json(['message' => 'Utilisateur non trouvé'], 404);

        $cartItems = $em->getRepository(CartItem::class)->findBy(['user' => $user]);
        if (empty($cartItems)) return $this->json(['message' => 'Panier vide'], 400);

        $total = 0;
        $order = new Order();
        $order->setUser($user);
        $order->setPaymentMethod($payload['paymentMethod'] ?? 'card');

        // J'enregistre l'adresse de facturation transmise depuis le frontend
        $order->setBillingAddress($payload['billingAddress'] ?? 'Adresse non spécifiée');

        foreach ($cartItems as $cartItem) {
            $item = new OrderItem();
            $item->setServiceName($cartItem->getServiceSaas()->getName());
            $item->setPrice($cartItem->getServiceSaas()->getPrice());
            $item->setQuantity($cartItem->getQuantity());
            $item->setSubscriptionDuration($cartItem->getSubscriptionDuration());
            $item->setImage($cartItem->getServiceSaas()->getImage());

            $order->addItem($item);
            $em->persist($item);
            $total += $cartItem->getServiceSaas()->getPrice() * $cartItem->getQuantity();

            $em->remove($cartItem);
        }

        $order->setTotal(number_format($total, 2, '.', ''));
        $em->persist($order);
        $em->flush();

        return $this->json(['message' => 'Commande créée', 'orderId' => $order->getId()], 201);
    }

    #[Route('/wishlist', name: 'wishlist_get', methods: ['GET', 'OPTIONS'])]
    public function getWishlist(Request $request, EntityManagerInterface $em): JsonResponse
    {
        if ($request->getMethod() === 'OPTIONS') return new JsonResponse(null, 204);

        $email = $request->query->get('email');
        $user  = $em->getRepository(User::class)->findOneBy(['email' => $email]);
        if (!$user) return $this->json(['message' => 'Utilisateur non trouvé'], 404);

        $items = $em->getRepository(Wishlist::class)->findBy(['user' => $user]);

        $data = array_map(function($w) {
            // J'adapte la récupération pour l'entité ServiceSaas (assurez-vous d'avoir mis à jour l'entité Wishlist également)
            return [
                'id'    => $w->getId(),
                'name'  => $w->getServiceSaas()->getName(),
                'price' => $w->getServiceSaas()->getPrice(),
                'image' => $w->getServiceSaas()->getImage(),
            ];
        }, $items);

        return $this->json(['items' => $data]);
    }

    #[Route('/modifier', name: 'modifier', methods: ['PUT', 'OPTIONS'])]
    public function modifier(Request $request, EntityManagerInterface $em, UserPasswordHasherInterface $hasher): JsonResponse
    {
        if ($request->getMethod() === 'OPTIONS') return new JsonResponse(null, 204);

        $payload = json_decode($request->getContent(), true);
        $email   = $payload['email'] ?? null;
        $user    = $em->getRepository(User::class)->findOneBy(['email' => $email]);

        if (!$user) return $this->json(['message' => 'Utilisateur non trouvé'], 404);

        if (!empty($payload['prenom'])) $user->setPrenom($payload['prenom']);
        if (!empty($payload['nom']))    $user->setNom($payload['nom']);
        if (!empty($payload['avatar'])) $user->setAvatar($payload['avatar']);

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

    #[Route('/adresses', name: 'adresses_get', methods: ['GET', 'OPTIONS'])]
    public function getAdresses(Request $request, EntityManagerInterface $em): JsonResponse
    {
        if ($request->getMethod() === 'OPTIONS') return new JsonResponse(null, 204);

        $email = $request->query->get('email');
        $user  = $em->getRepository(User::class)->findOneBy(['email' => $email]);
        if (!$user) return $this->json(['message' => 'Utilisateur non trouvé'], 404);

        $adresses = $em->getRepository(Address::class)->findBy(['user' => $user]);

        $data = array_map(function($addr) {
            return [
                'id'         => $addr->getId(),
                'prenom'     => $addr->getPrenom(),
                'nom'        => $addr->getNom(),
                'adresse1'   => $addr->getAdresse1(),
                'adresse2'   => $addr->getAdresse2(),
                'ville'      => $addr->getVille(),
                'region'     => $addr->getRegion(),
                'codePostal' => $addr->getCodePostal(),
                'pays'       => $addr->getPays(),
                'telephone'  => $addr->getTelephone()
            ];
        }, $adresses);

        return $this->json(['adresses' => $data]);
    }

    #[Route('/adresses/ajouter', name: 'adresses_add', methods: ['POST', 'OPTIONS'])]
    public function addAdresse(Request $request, EntityManagerInterface $em): JsonResponse
    {
        if ($request->getMethod() === 'OPTIONS') return new JsonResponse(null, 204);

        $payload = json_decode($request->getContent(), true);
        $email   = $payload['email'] ?? null;
        $user    = $em->getRepository(User::class)->findOneBy(['email' => $email]);

        if (!$user) return $this->json(['message' => 'Utilisateur non trouvé'], 404);

        $address = new Address();
        $address->setUser($user);
        $address->setPrenom($payload['prenom'] ?? '');
        $address->setNom($payload['nom'] ?? '');
        $address->setAdresse1($payload['adresse1'] ?? '');
        $address->setAdresse2($payload['adresse2'] ?? null);
        $address->setVille($payload['ville'] ?? '');
        $address->setRegion($payload['region'] ?? '');
        $address->setCodePostal($payload['codePostal'] ?? '');
        $address->setPays($payload['pays'] ?? '');
        $address->setTelephone($payload['telephone'] ?? '');

        $em->persist($address);
        $em->flush();

        return $this->json(['message' => 'Adresse ajoutée avec succès'], 201);
    }

    #[Route('/adresses/supprimer/{id}', name: 'adresses_remove', methods: ['DELETE', 'OPTIONS'])]
    public function removeAdresse(int $id, Request $request, EntityManagerInterface $em): JsonResponse
    {
        if ($request->getMethod() === 'OPTIONS') return new JsonResponse(null, 204);

        $email = $request->query->get('email');
        $user  = $em->getRepository(User::class)->findOneBy(['email' => $email]);

        if (!$user) return $this->json(['message' => 'Utilisateur non trouvé'], 404);

        $address = $em->getRepository(Address::class)->findOneBy(['id' => $id, 'user' => $user]);
        if (!$address) return $this->json(['message' => 'Adresse introuvable'], 404);

        $em->remove($address);
        $em->flush();

        return $this->json(['message' => 'Adresse supprimée']);
    }
}
