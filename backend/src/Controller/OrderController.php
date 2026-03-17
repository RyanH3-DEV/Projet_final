<?php

namespace App\Controller;

use App\Entity\Order;
use App\Entity\OrderItem;
use App\Repository\UserRepository;
use App\Repository\ServiceSaasRepository;
use App\Service\InvoiceGenerator;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/profil/commandes', name: 'api_orders_')]
class OrderController extends AbstractController
{
    #[Route('/creer', name: 'create', methods: ['POST', 'OPTIONS'])]
    public function create(
        Request $request,
        UserRepository $userRepo,
        ServiceSaasRepository $serviceRepo,
        EntityManagerInterface $em,
        InvoiceGenerator $invoiceGenerator
    ): JsonResponse {
        if ($request->getMethod() === 'OPTIONS') {
            return new JsonResponse(null, 204);
        }

        $data = json_decode($request->getContent(), true);
        $user = $userRepo->findOneBy(['email' => $data['email']]);

        if (!$user) {
            return $this->json(['message' => 'Utilisateur introuvable'], 404);
        }

        $order = new Order();
        $order->setUser($user);
        $order->setPaymentMethod($data['paymentMethod'] ?? 'card');
        $order->setBillingAddress($data['billingAddress'] ?? 'Non renseignée');
        $order->setStatus('completed');

        $totalHT = 0;

        foreach ($data['cart'] as $cartItem) {
            $service = $serviceRepo->find($cartItem['id']);
            if ($service) {
                $orderItem = new OrderItem();
                $orderItem->setServiceName($service->getName());
                $orderItem->setPrice($service->getPrice());
                $orderItem->setQuantity($cartItem['quantity']);
                $orderItem->setSubscriptionDuration($cartItem['subscriptionDuration']);

                $order->addItem($orderItem);
                $totalHT += ($service->getPrice() * $cartItem['quantity']);
            }
        }

        $order->setTotal((string)$totalHT);
        $em->persist($order);
        $em->flush();

        $invoicePath = $invoiceGenerator->generate($order);
        $order->setInvoicePath($invoicePath);
        $em->flush();

        return $this->json([
            'success' => true,
            'orderId' => $order->getId(),
            'invoice' => $invoicePath
        ]);
    }

    #[Route('', name: 'list', methods: ['GET', 'OPTIONS'])]
    public function list(Request $request, UserRepository $userRepo): JsonResponse
    {
        if ($request->getMethod() === 'OPTIONS') {
            return new JsonResponse(null, 204);
        }

        $email = $request->query->get('email');
        $user = $userRepo->findOneBy(['email' => $email]);

        if (!$user) {
            return $this->json(['message' => 'Utilisateur introuvable'], 404);
        }

        $orders = $em->getRepository(Order::class)->findBy(['user' => $user], ['createdAt' => 'DESC']);
        $data = [];

        foreach ($orders as $order) {
            $items = [];
            foreach ($order->getItems() as $item) {
                $items[] = [
                    'serviceName'          => $item->getServiceName(),
                    'price'                => $item->getPrice(),
                    'quantity'             => $item->getQuantity(),
                    'subscriptionDuration' => $item->getSubscriptionDuration(),
                ];
            }

            $data[] = [
                'id'             => $order->getId(),
                'date'           => $order->getCreatedAt()->format('d/m/Y'),
                'total'          => $order->getTotal(),
                'status'         => $order->getStatus(),
                'billingAddress' => $order->getBillingAddress(),
                'invoicePath'    => $order->getInvoicePath(),
                'items'          => $items
            ];
        }

        return $this->json(['orders' => $data]);
    }
    #[Route('/{id}/facture', name: 'download_invoice', methods: ['GET', 'OPTIONS'])]
public function downloadInvoice(int $id, Request $request, EntityManagerInterface $em): Response
{
    if ($request->getMethod() === 'OPTIONS') {
        return new JsonResponse(null, 204);
    }

    $order = $em->getRepository(Order::class)->find($id);
    $userEmail = $request->query->get('email'); // Ou via header X-User-Email

    // ── Sécurité : Je vérifie que la commande existe et appartient bien à l'utilisateur
    if (!$order || $order->getUser()->getEmail() !== $userEmail) {
        return new JsonResponse(['error' => 'Accès refusé ou facture introuvable'], 403);
    }

    $invoicePath = $order->getInvoicePath();
    if (!$invoicePath) {
        return new JsonResponse(['error' => 'Le fichier de facture n\'a pas encore été généré'], 404);
    }

    $filePath = $this->getParameter('kernel.project_dir') . '/public/uploads/invoices/' . $invoicePath;

    if (!file_exists($filePath)) {
        return new JsonResponse(['error' => 'Fichier physique introuvable sur le serveur'], 404);
    }

    // ── Je prépare la réponse pour le téléchargement
    $response = new BinaryFileResponse($filePath);
    $response->setContentDisposition(
        ResponseHeaderBag::DISPOSITION_ATTACHMENT,
        'facture_cyna_' . $order->getId() . '.pdf'
    );

    return $response;
}
}
