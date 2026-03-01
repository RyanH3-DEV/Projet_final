<?php

namespace App\Controller;

use App\Entity\CartItem;
use App\Entity\Livre;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/cart', name: 'api_cart_')]
class CartController extends AbstractController
{
    #[Route('/', name: 'index', methods: ['GET', 'OPTIONS'])]
    public function index(Request $request, EntityManagerInterface $em): JsonResponse
    {
        if ($request->getMethod() === 'OPTIONS') {
            return new JsonResponse(null, 204);
        }

        $email = $request->query->get('email');
        $user = $em->getRepository(User::class)->findOneBy(['email' => $email]);

        if (!$user) {
            return $this->json(['message' => 'Utilisateur non connecté'], 401);
        }

        $items = $em->getRepository(CartItem::class)->findBy(['user' => $user]);

        $data = array_map(fn($item) => [
            'id'       => $item->getId(),
            'title'    => $item->getLivre()->getTitle(),
            'price'    => $item->getLivre()->getPrice(),
            'quantity' => $item->getQuantity(),
            'image'    => $item->getLivre()->getImage()
        ], $items);

        return $this->json(['items' => $data]);
    }

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
            return $this->json(['message' => 'Connexion requise'], 401);
        }

        $title = $payload['title'] ?? null;
        $livre = $em->getRepository(Livre::class)->findOneBy(['title' => $title]);

        if (!$livre) {
            $livre = new Livre();
            $livre->setTitle($title);
            $livre->setPrice((float)($payload['price'] ?? 12.99));
            $livre->setImage($payload['image'] ?? '');
            $em->persist($livre);
            $em->flush();
        }

        $item = $em->getRepository(CartItem::class)->findOneBy(['user' => $user, 'livre' => $livre]);

        if ($item) {
            $item->setQuantity($item->getQuantity() + ($payload['quantity'] ?? 1));
        } else {
            $item = new CartItem();
            $item->setUser($user);
            $item->setLivre($livre);
            $item->setQuantity($payload['quantity'] ?? 1);
            $em->persist($item);
        }

        $em->flush();
        return $this->json(['message' => 'Livre ajouté avec succès au panier permanent']);
    }

    // ✅ NOUVELLE ROUTE : mettre à jour la quantité d'un article
    #[Route('/update/{id}', name: 'update', methods: ['PUT', 'OPTIONS'])]
    public function update(int $id, Request $request, EntityManagerInterface $em): JsonResponse
    {
        if ($request->getMethod() === 'OPTIONS') {
            return new JsonResponse(null, 204);
        }

        $payload  = json_decode($request->getContent(), true);
        $email    = $payload['email'] ?? null;
        $quantite = (int)($payload['quantity'] ?? 1);

        $user = $em->getRepository(User::class)->findOneBy(['email' => $email]);
        if (!$user) {
            return $this->json(['message' => 'Connexion requise'], 401);
        }

        $item = $em->getRepository(CartItem::class)->findOneBy([
            'id'   => $id,
            'user' => $user
        ]);

        if (!$item) {
            return $this->json(['message' => 'Article introuvable dans le panier'], 404);
        }

        // Si quantité tombe à 0 ou moins, on supprime l'article
        if ($quantite <= 0) {
            $em->remove($item);
            $em->flush();
            return $this->json(['message' => 'Article supprimé du panier']);
        }

        $item->setQuantity($quantite);
        $em->flush();

        return $this->json(['message' => 'Quantité mise à jour', 'quantity' => $item->getQuantity()]);
    }

    // ✅ NOUVELLE ROUTE : supprimer un article du panier
    #[Route('/remove/{id}', name: 'remove', methods: ['DELETE', 'OPTIONS'])]
    public function remove(int $id, Request $request, EntityManagerInterface $em): JsonResponse
    {
        if ($request->getMethod() === 'OPTIONS') {
            return new JsonResponse(null, 204);
        }

        $email = $request->query->get('email');
        $user  = $em->getRepository(User::class)->findOneBy(['email' => $email]);

        if (!$user) {
            return $this->json(['message' => 'Connexion requise'], 401);
        }

        $item = $em->getRepository(CartItem::class)->findOneBy([
            'id'   => $id,
            'user' => $user
        ]);

        if (!$item) {
            return $this->json(['message' => 'Article introuvable dans le panier'], 404);
        }

        $em->remove($item);
        $em->flush();

        return $this->json(['message' => 'Article supprimé avec succès']);
    }
}
