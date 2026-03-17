<?php

namespace App\Controller;

use App\Entity\CartItem;
use App\Entity\ServiceSaas;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/cart', name: 'api_cart_')]
class CartController extends AbstractController
{
    /**
     * Je récupère tous les services présents dans le panier d'un utilisateur
     */
    #[Route('/', name: 'index', methods: ['GET', 'OPTIONS'])]
    public function index(Request $request, EntityManagerInterface $em): JsonResponse
    {
        if ($request->getMethod() === 'OPTIONS') {
            return new JsonResponse(null, 204);
        }

        $email = $request->query->get('email');
        $user = $em->getRepository(User::class)->findOneBy(['email' => $email]);

        if (!$user) {
            return $this->json(['message' => 'Utilisateur non identifié'], 401);
        }

        $items = $em->getRepository(CartItem::class)->findBy(['user' => $user]);

        $data = array_map(fn($item) => [
            'id'                   => $item->getId(),
            'serviceId'            => $item->getServiceSaas()->getId(),
            'name'                 => $item->getServiceSaas()->getName(),
            'price'                => $item->getServiceSaas()->getPrice(),
            'quantity'             => $item->getQuantity(),
            'subscriptionDuration' => $item->getSubscriptionDuration(),
            'image'                => $item->getServiceSaas()->getImage(),
            'isAvailable'          => $item->getServiceSaas()->isAvailable()
        ], $items);

        return $this->json(['items' => $data]);
    }

    /**
     * J'ajoute un service au panier ou j'incrémente la quantité si déjà présent
     */
    #[Route('/add', name: 'add', methods: ['POST', 'OPTIONS'])]
    public function add(Request $request, EntityManagerInterface $em): JsonResponse
    {
        if ($request->getMethod() === 'OPTIONS') {
            return new JsonResponse(null, 204);
        }

        $payload = json_decode($request->getContent(), true);
        $email   = $payload['email'] ?? null;
        $user    = $em->getRepository(User::class)->findOneBy(['email' => $email]);

        if (!$user) {
            return $this->json(['message' => 'Connexion requise pour cette action'], 401);
        }

        $serviceId = $payload['serviceId'] ?? null;
        $service = $em->getRepository(ServiceSaas::class)->find($serviceId);

        if (!$service) {
            return $this->json(['message' => 'Le service spécifié est introuvable'], 404);
        }

        $duration = $payload['subscriptionDuration'] ?? 'mensuel';
        $quantityToAdd = (int)($payload['quantity'] ?? 1);

        // Je vérifie si ce service avec la même durée est déjà dans le panier
        $item = $em->getRepository(CartItem::class)->findOneBy([
            'user'                 => $user,
            'serviceSaas'          => $service,
            'subscriptionDuration' => $duration
        ]);

        if ($item) {
            $item->setQuantity($item->getQuantity() + $quantityToAdd);
        } else {
            $item = new CartItem();
            $item->setUser($user);
            $item->setServiceSaas($service);
            $item->setQuantity($quantityToAdd);
            $item->setSubscriptionDuration($duration);
            $em->persist($item);
        }

        $em->flush();
        return $this->json(['message' => 'Service ajouté à votre infrastructure de commande']);
    }

    /**
     * Je mets à jour la quantité ou la durée d'un article spécifique
     */
    #[Route('/update/{id}', name: 'update', methods: ['PUT', 'OPTIONS'])]
    public function update(int $id, Request $request, EntityManagerInterface $em): JsonResponse
    {
        if ($request->getMethod() === 'OPTIONS') {
            return new JsonResponse(null, 204);
        }

        $payload  = json_decode($request->getContent(), true);
        $email    = $payload['email'] ?? null;
        $user     = $em->getRepository(User::class)->findOneBy(['email' => $email]);

        if (!$user) {
            return $this->json(['message' => 'Accès non autorisé'], 401);
        }

        $item = $em->getRepository(CartItem::class)->findOneBy([
            'id'   => $id,
            'user' => $user
        ]);

        if (!$item) {
            return $this->json(['message' => 'Article introuvable dans votre panier'], 404);
        }

        // Mise à jour de la quantité
        if (isset($payload['quantity'])) {
            $newQty = (int)$payload['quantity'];
            if ($newQty <= 0) {
                $em->remove($item);
            } else {
                $item->setQuantity($newQty);
            }
        }

        // Mise à jour de la durée (mensuel/annuel)
        if (isset($payload['subscriptionDuration'])) {
            $item->setSubscriptionDuration($payload['subscriptionDuration']);
        }

        $em->flush();

        return $this->json([
            'message'              => 'Mise à jour effectuée',
            'quantity'             => $item->getQuantity(),
            'subscriptionDuration' => $item->getSubscriptionDuration()
        ]);
    }

    /**
     * Je supprime un article précis du panier
     */
    #[Route('/remove/{id}', name: 'remove', methods: ['DELETE', 'OPTIONS'])]
    public function remove(int $id, Request $request, EntityManagerInterface $em): JsonResponse
    {
        if ($request->getMethod() === 'OPTIONS') {
            return new JsonResponse(null, 204);
        }

        $email = $request->query->get('email');
        $user  = $em->getRepository(User::class)->findOneBy(['email' => $email]);

        if (!$user) {
            return $this->json(['message' => 'Utilisateur non reconnu'], 401);
        }

        $item = $em->getRepository(CartItem::class)->findOneBy([
            'id'   => $id,
            'user' => $user
        ]);

        if (!$item) {
            return $this->json(['message' => 'L\'article n\'existe pas ou a déjà été supprimé'], 404);
        }

        $em->remove($item);
        $em->flush();

        return $this->json(['message' => 'Article révoqué du panier']);
    }

    /**
     * Je vide entièrement le panier (utile après la validation d'une commande)
     */
    #[Route('/clear', name: 'clear', methods: ['DELETE', 'OPTIONS'])]
    public function clear(Request $request, EntityManagerInterface $em): JsonResponse
    {
        if ($request->getMethod() === 'OPTIONS') {
            return new JsonResponse(null, 204);
        }

        $email = $request->query->get('email');
        $user  = $em->getRepository(User::class)->findOneBy(['email' => $email]);

        if (!$user) {
            return $this->json(['message' => 'Utilisateur introuvable'], 404);
        }

        $items = $em->getRepository(CartItem::class)->findBy(['user' => $user]);

        foreach ($items as $item) {
            $em->remove($item);
        }

        $em->flush();

        return $this->json(['message' => 'Votre panier a été entièrement réinitialisé']);
    }
}
