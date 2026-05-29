<?php

namespace App\Controller;

use App\Entity\Order;
use App\Entity\OrderItem;
use App\Entity\Wishlist;
use App\Entity\ServiceSaas;
use App\Entity\User;
use App\Entity\CartItem;
use App\Entity\Address;
use App\Entity\Subscription;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
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
        if (!$user) return $this->json(['message' => 'Utilisateur non trouve'], 404);

        $orders = $em->getRepository(Order::class)->findBy(
            ['user' => $user],
            ['createdAt' => 'DESC']
        );

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
    public function creerCommande(Request $request, EntityManagerInterface $em, MailerInterface $mailer): JsonResponse
    {
        if ($request->getMethod() === 'OPTIONS') return new JsonResponse(null, 204);

        $payload = json_decode($request->getContent(), true);
        $email   = $payload['email'] ?? null;
        $user    = $em->getRepository(User::class)->findOneBy(['email' => $email]);

        if (!$user) return $this->json(['message' => 'Utilisateur non trouve'], 404);

        $cartItems = $em->getRepository(CartItem::class)->findBy(['user' => $user]);
        if (empty($cartItems)) return $this->json(['message' => 'Panier vide'], 400);

        $total = 0;
        $order = new Order();
        $order->setUser($user);
        $order->setPaymentMethod($payload['paymentMethod'] ?? 'card');
        $order->setBillingAddress($payload['billingAddress'] ?? 'Adresse non specifiee');

        $lignesEmail = [];

        foreach ($cartItems as $cartItem) {
            $item = new OrderItem();
            $item->setServiceName($cartItem->getServiceSaas()->getName());
            $item->setPrice($cartItem->getServiceSaas()->getPrice());
            $item->setQuantity($cartItem->getQuantity());
            $item->setSubscriptionDuration($cartItem->getSubscriptionDuration());
            $item->setImage($cartItem->getServiceSaas()->getImage());

            $order->addItem($item);
            $em->persist($item);

            $sousTotal = $cartItem->getServiceSaas()->getPrice() * $cartItem->getQuantity();
            $total += $sousTotal;

            $duree = $cartItem->getSubscriptionDuration() === 'annuel' ? 'Annuel' : 'Mensuel';
            $lignesEmail[] = [
                'nom'   => $cartItem->getServiceSaas()->getName(),
                'qte'   => $cartItem->getQuantity(),
                'duree' => $duree,
                'prix'  => number_format($sousTotal, 2, '.', ''),
            ];

            $em->remove($cartItem);
        }

        $order->setTotal(number_format($total, 2, '.', ''));
        $em->persist($order);
        $em->flush();

        // ── Création automatique des abonnements après paiement ───────────────
        foreach ($order->getItems() as $item) {
            $service = $em->getRepository(ServiceSaas::class)
                ->findOneBy(['name' => $item->getServiceName()]);

            if (!$service) continue;

            $sub = new Subscription();
            $sub->setUser($user);
            $sub->setServiceSaas($service);
            $sub->setBillingPeriod($item->getSubscriptionDuration());
            $sub->setPriceSnapshot($item->getPrice());
            $sub->setQuantity($item->getQuantity());
            $sub->setOriginOrder($order);
            $sub->computeEndsAt();

            $em->persist($sub);
        }

        $em->flush();

        // ── Envoi de l'email de confirmation ──────────────────────────────────
        try {
            $mailer->send($this->buildOrderEmail(
                $user,
                $order->getId(),
                $lignesEmail,
                number_format($total, 2, '.', ''),
                $payload['paymentMethod'] ?? 'card'
            ));
        } catch (\Exception $e) {
            // Email optionnel — la commande est enregistrée même si l'email échoue
        }

        return $this->json(['message' => 'Commande creee', 'orderId' => $order->getId()], 201);
    }

    private function buildOrderEmail(User $user, int $orderId, array $lignes, string $total, string $methodePaiement): Email
    {
        $lignesHtml = '';
        foreach ($lignes as $ligne) {
            $lignesHtml .= "
                <tr>
                    <td style='padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.06);color:#e8eaf0;font-size:14px;'>{$ligne['nom']}</td>
                    <td style='padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.06);color:rgba(232,234,240,0.6);font-size:14px;text-align:center;'>{$ligne['qte']}</td>
                    <td style='padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.06);color:rgba(232,234,240,0.6);font-size:14px;text-align:center;'>{$ligne['duree']}</td>
                    <td style='padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.06);color:#00e5ff;font-size:14px;text-align:right;font-weight:600;'>{$ligne['prix']} EUR</td>
                </tr>
            ";
        }

        $prenom       = $user->getPrenom() ?: $user->getEmail();
        $methodeLabel = $methodePaiement === 'paypal' ? 'PayPal' : 'Carte bancaire';
        $date         = (new \DateTimeImmutable())->format('d/m/Y');

        $html = <<<HTML
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#050810;font-family:'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#050810;padding:40px 0;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0"
             style="background:#0d1117;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;">

        <tr>
          <td style="background:linear-gradient(135deg,#050810,#0d1117);padding:32px 40px;border-bottom:1px solid rgba(0,229,255,0.15);">
            <p style="margin:0;font-size:22px;font-weight:700;color:#e8eaf0;letter-spacing:-0.02em;">
              <span style="color:#00e5ff;">CY</span>NA
            </p>
            <p style="margin:6px 0 0;font-size:11px;color:rgba(232,234,240,0.4);letter-spacing:0.1em;text-transform:uppercase;">
              Confirmation de commande
            </p>
          </td>
        </tr>

        <tr>
          <td style="padding:40px 40px 32px;">
            <p style="margin:0 0 8px;font-size:13px;color:rgba(232,234,240,0.4);letter-spacing:0.08em;text-transform:uppercase;">
              Merci pour votre confiance
            </p>
            <h1 style="margin:0 0 20px;font-size:24px;font-weight:700;color:#e8eaf0;letter-spacing:-0.02em;">
              Bonjour {$prenom} !
            </h1>
            <p style="margin:0 0 24px;font-size:15px;color:rgba(232,234,240,0.65);line-height:1.7;">
              Votre commande <strong style="color:#00e5ff;">#${orderId}</strong> du <strong style="color:#e8eaf0;">{$date}</strong>
              a bien ete enregistree et est en cours d'activation.
            </p>

            <table width="100%" cellpadding="0" cellspacing="0"
                   style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:10px;margin-bottom:24px;overflow:hidden;">
              <tr style="background:rgba(0,229,255,0.06);">
                <th style="padding:10px 16px;text-align:left;font-size:11px;color:rgba(232,234,240,0.4);letter-spacing:0.08em;text-transform:uppercase;font-weight:600;">Service</th>
                <th style="padding:10px 16px;text-align:center;font-size:11px;color:rgba(232,234,240,0.4);letter-spacing:0.08em;text-transform:uppercase;font-weight:600;">Licences</th>
                <th style="padding:10px 16px;text-align:center;font-size:11px;color:rgba(232,234,240,0.4);letter-spacing:0.08em;text-transform:uppercase;font-weight:600;">Duree</th>
                <th style="padding:10px 16px;text-align:right;font-size:11px;color:rgba(232,234,240,0.4);letter-spacing:0.08em;text-transform:uppercase;font-weight:600;">Total</th>
              </tr>
              {$lignesHtml}
              <tr style="background:rgba(0,229,255,0.04);">
                <td colspan="3" style="padding:14px 16px;color:#e8eaf0;font-weight:700;font-size:15px;">Total HT</td>
                <td style="padding:14px 16px;color:#00e5ff;font-weight:700;font-size:18px;text-align:right;">{$total} EUR</td>
              </tr>
            </table>

            <p style="margin:0 0 24px;font-size:13px;color:rgba(232,234,240,0.4);">
              Paiement effectue via <strong style="color:#e8eaf0;">{$methodeLabel}</strong>
            </p>

            <table cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
              <tr>
                <td style="background:#00e5ff;border-radius:10px;">
                  <a href="{$_ENV['FRONTEND_URL']}/profil"
                     style="display:inline-block;padding:14px 32px;font-size:14px;font-weight:700;color:#050810;text-decoration:none;">
                    Voir mes souscriptions
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin:0;font-size:13px;color:rgba(232,234,240,0.3);line-height:1.6;">
              Vos services seront actives sous 24h. Pour toute question, contactez notre support.
            </p>
          </td>
        </tr>

        <tr>
          <td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.06);">
            <p style="margin:0;font-size:11px;color:rgba(232,234,240,0.2);text-align:center;">
              Cyna &mdash; Plateforme SaaS de cybersecurite &mdash; ISO 27001 &middot; SOC 2 Type II
            </p>
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
            ->subject("Confirmation de votre commande Cyna #${orderId}")
            ->html($html);
    }

    #[Route('/wishlist', name: 'wishlist_get', methods: ['GET', 'OPTIONS'])]
    public function getWishlist(Request $request, EntityManagerInterface $em): JsonResponse
    {
        if ($request->getMethod() === 'OPTIONS') return new JsonResponse(null, 204);

        $email = $request->query->get('email');
        $user  = $em->getRepository(User::class)->findOneBy(['email' => $email]);
        if (!$user) return $this->json(['message' => 'Utilisateur non trouve'], 404);

        $items = $em->getRepository(Wishlist::class)->findBy(['user' => $user]);

        $data = array_map(function($w) {
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

        if (!$user) return $this->json(['message' => 'Utilisateur non trouve'], 404);

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
            'message' => 'Profil mis a jour',
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
        if (!$user) return $this->json(['message' => 'Utilisateur non trouve'], 404);

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

        if (!$user) return $this->json(['message' => 'Utilisateur non trouve'], 404);

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

        return $this->json(['message' => 'Adresse ajoutee avec succes'], 201);
    }

    #[Route('/adresses/supprimer/{id}', name: 'adresses_remove', methods: ['DELETE', 'OPTIONS'])]
    public function removeAdresse(int $id, Request $request, EntityManagerInterface $em): JsonResponse
    {
        if ($request->getMethod() === 'OPTIONS') return new JsonResponse(null, 204);

        $email = $request->query->get('email');
        $user  = $em->getRepository(User::class)->findOneBy(['email' => $email]);

        if (!$user) return $this->json(['message' => 'Utilisateur non trouve'], 404);

        $address = $em->getRepository(Address::class)->findOneBy(['id' => $id, 'user' => $user]);
        if (!$address) return $this->json(['message' => 'Adresse introuvable'], 404);

        $em->remove($address);
        $em->flush();

        return $this->json(['message' => 'Adresse supprimee']);
    }

    #[Route('/wishlist/add', name: 'wishlist_add', methods: ['POST', 'OPTIONS'])]
    public function addWishlist(Request $request, EntityManagerInterface $em): JsonResponse
    {
        if ($request->getMethod() === 'OPTIONS') return new JsonResponse(null, 204);

        $payload   = json_decode($request->getContent(), true);
        $email     = $payload['email'] ?? null;
        $serviceId = $payload['serviceId'] ?? null;

        $user    = $em->getRepository(User::class)->findOneBy(['email' => $email]);
        $service = $em->getRepository(ServiceSaas::class)->find($serviceId);

        if (!$user || !$service) {
            return $this->json(['message' => 'Utilisateur ou service introuvable'], 404);
        }

        $existe = $em->getRepository(Wishlist::class)->findOneBy([
            'user'        => $user,
            'serviceSaas' => $service,
        ]);

        if ($existe) {
            return $this->json(['message' => 'Deja dans la wishlist'], 200);
        }

        $wishlist = new Wishlist();
        $wishlist->setUser($user);
        $wishlist->setServiceSaas($service);

        $em->persist($wishlist);
        $em->flush();

        return $this->json(['message' => 'Ajoute a la wishlist'], 201);
    }

    #[Route('/commandes/{orderId}/facture', name: 'commandes_facture', methods: ['GET', 'OPTIONS'])]
    public function telechargerFacture(int $orderId, Request $request, EntityManagerInterface $em): JsonResponse
    {
        if ($request->getMethod() === 'OPTIONS') return new JsonResponse(null, 204);

        $email = $request->query->get('email');
        $user  = $em->getRepository(User::class)->findOneBy(['email' => $email]);
        if (!$user) return $this->json(['message' => 'Utilisateur non trouve'], 404);

        $order = $em->getRepository(Order::class)->findOneBy(['id' => $orderId, 'user' => $user]);
        if (!$order) return $this->json(['message' => 'Commande introuvable'], 404);

        return $this->json(['invoicePath' => $order->getInvoicePath()]);
    }
}
