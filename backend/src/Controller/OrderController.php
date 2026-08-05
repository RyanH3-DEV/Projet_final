<?php

namespace App\Controller;

use App\Entity\CartItem;
use App\Entity\Order;
use App\Entity\OrderItem;
use App\Entity\ServiceSaas;
use App\Entity\Subscription;
use App\Repository\UserRepository;
use App\Repository\ServiceSaasRepository;
use App\Service\InvoiceGenerator;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
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
        InvoiceGenerator $invoiceGenerator,
        MailerInterface $mailer
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
        $lignesEmail = [];
        $servicesAchetes = [];

        foreach ($data['cart'] as $cartItem) {
            $service = $serviceRepo->find($cartItem['id']);
            if ($service) {
                $orderItem = new OrderItem();
                $orderItem->setServiceName($service->getName());
                $orderItem->setPrice($service->getPrice());
                $orderItem->setQuantity($cartItem['quantity']);
                $orderItem->setSubscriptionDuration($cartItem['subscriptionDuration']);
                $orderItem->setImage($service->getImage());

                $order->addItem($orderItem);
                $totalHT += ($service->getPrice() * $cartItem['quantity']);

                $sousTotal = $service->getPrice() * $cartItem['quantity'];
                $duree = $cartItem['subscriptionDuration'] === 'annuel' ? 'Annuel' : 'Mensuel';
                $lignesEmail[] = [
                    'nom'   => $service->getName(),
                    'qte'   => $cartItem['quantity'],
                    'duree' => $duree,
                    'prix'  => number_format($sousTotal, 2, '.', ''),
                ];

                $servicesAchetes[] = [
                    'service'  => $service,
                    'quantity' => $cartItem['quantity'],
                    'duration' => $cartItem['subscriptionDuration'],
                    'price'    => $service->getPrice(),
                ];
            }
        }

        $order->setTotal((string)$totalHT);
        $em->persist($order);
        $em->flush();

        // Creation des abonnements
        foreach ($servicesAchetes as $achat) {
            $sub = new Subscription();
            $sub->setUser($user);
            $sub->setServiceSaas($achat['service']);
            $sub->setBillingPeriod($achat['duration']);
            $sub->setPriceSnapshot($achat['price']);
            $sub->setQuantity($achat['quantity']);
            $sub->setOriginOrder($order);
            $sub->computeEndsAt();

            $em->persist($sub);
        }
        $em->flush();

        // Vidage du panier
        $cartItems = $em->getRepository(CartItem::class)->findBy(['user' => $user]);
        foreach ($cartItems as $item) {
            $em->remove($item);
        }
        $em->flush();

        // Generation de la facture PDF
        $invoiceFileName = null;
        try {
            $invoiceFileName = $invoiceGenerator->generate($order);
            $order->setInvoicePath($invoiceFileName);
            $em->flush();
        } catch (\Exception $e) {
        }

        // Envoi de l'email de confirmation avec facture jointe
        try {
            $email = $this->buildOrderEmail(
                $user,
                $order->getId(),
                $lignesEmail,
                number_format($totalHT, 2, '.', ''),
                $data['paymentMethod'] ?? 'card'
            );

            if ($invoiceFileName) {
                $invoicePath = $this->getParameter('kernel.project_dir') . '/public/uploads/invoices/' . $invoiceFileName;
                if (file_exists($invoicePath)) {
                    $email->attachFromPath($invoicePath, 'facture_CYN-' . $order->getId() . '.pdf', 'application/pdf');
                }
            }

            $mailer->send($email);
        } catch (\Exception $e) {
        }

        return $this->json([
            'success' => true,
            'orderId' => $order->getId(),
            'invoice' => $invoiceFileName
        ]);
    }

    private function buildOrderEmail(\App\Entity\User $user, int $orderId, array $lignes, string $total, string $methodePaiement): Email
    {
        $lignesHtml = '';
        foreach ($lignes as $ligne) {
            $lignesHtml .= "
                <tr>
                    <td style='padding:12px 16px;border-bottom:1px solid #eee;color:#1e2328;font-size:14px;'>{$ligne['nom']}</td>
                    <td style='padding:12px 16px;border-bottom:1px solid #eee;color:#666;font-size:14px;text-align:center;'>{$ligne['qte']}</td>
                    <td style='padding:12px 16px;border-bottom:1px solid #eee;color:#666;font-size:14px;text-align:center;'>{$ligne['duree']}</td>
                    <td style='padding:12px 16px;border-bottom:1px solid #eee;color:#00a8cc;font-size:14px;text-align:right;font-weight:600;'>{$ligne['prix']} EUR</td>
                </tr>
            ";
        }

        $prenom       = $user->getPrenom() ?: $user->getEmail();
        $methodeLabel = $methodePaiement === 'paypal' ? 'PayPal' : 'Carte bancaire';
        $date         = (new \DateTimeImmutable())->format('d/m/Y');

        $html = <<<HTML
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:#1e2328;padding:28px 40px;">
            <p style="margin:0;font-size:22px;font-weight:700;color:#fff;">CY<span style="color:#00a8cc;">NA</span></p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
            <h1 style="margin:0 0 16px;font-size:22px;color:#1e2328;">Bonjour {$prenom} !</h1>
            <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.6;">
              Votre commande <strong>#CYN-{$orderId}</strong> du {$date} a bien ete enregistree et est en cours d'activation.
              Vous trouverez votre facture en piece jointe de cet email.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;border-radius:8px;margin-bottom:24px;">
              <tr style="background:#f8f9fa;">
                <th style="padding:10px 16px;text-align:left;font-size:11px;color:#999;">SERVICE</th>
                <th style="padding:10px 16px;text-align:center;font-size:11px;color:#999;">LIC.</th>
                <th style="padding:10px 16px;text-align:center;font-size:11px;color:#999;">DUREE</th>
                <th style="padding:10px 16px;text-align:right;font-size:11px;color:#999;">TOTAL</th>
              </tr>
              {$lignesHtml}
              <tr>
                <td colspan="3" style="padding:14px 16px;color:#1e2328;font-weight:700;">Total HT</td>
                <td style="padding:14px 16px;color:#00a8cc;font-weight:700;font-size:18px;text-align:right;">{$total} EUR</td>
              </tr>
            </table>
            <p style="margin:0;font-size:13px;color:#999;">Paiement via <strong>{$methodeLabel}</strong></p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
HTML;

        return (new Email())
            ->from('r.sebbouh@h3hitema.fr')
            ->to($user->getEmail())
            ->subject("Confirmation de votre commande Cyna #CYN-{$orderId}")
            ->html($html);
    }

    #[Route('', name: 'list', methods: ['GET', 'OPTIONS'])]
    public function list(Request $request, UserRepository $userRepo, EntityManagerInterface $em): JsonResponse
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

    #[Route('/{id}/facture-pdf', name: 'download_invoice', methods: ['GET', 'OPTIONS'])]
    public function downloadInvoice(int $id, Request $request, EntityManagerInterface $em): Response
    {
        if ($request->getMethod() === 'OPTIONS') {
            return new JsonResponse(null, 204);
        }

        $order = $em->getRepository(Order::class)->find($id);
        $userEmail = $request->query->get('email');

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

        $response = new BinaryFileResponse($filePath);
        $response->setContentDisposition(
            ResponseHeaderBag::DISPOSITION_ATTACHMENT,
            'facture_cyna_' . $order->getId() . '.pdf'
        );

        return $response;
    }
}
