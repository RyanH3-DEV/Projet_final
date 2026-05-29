<?php

namespace App\Controller;

use App\Entity\ContactMessage;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Component\Routing\Annotation\Route;

class MailController extends AbstractController
{
    #[Route('/api/contact-assistance', name: 'api_contact', methods: ['POST'])]
    public function support(Request $request, MailerInterface $mailer, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $emailAddress = $data['email'] ?? null;
        $sujet = $data['sujet'] ?? 'Sans sujet';
        $messageContent = $data['message'] ?? '';

        if (!$emailAddress || !$messageContent) {
            return new JsonResponse(['status' => 'error', 'message' => 'Email et message obligatoires.'], 400);
        }

        $contactMessage = new ContactMessage();
        $contactMessage->setEmail($emailAddress);
        $contactMessage->setSubject($sujet);
        $contactMessage->setMessage($messageContent);
        $contactMessage->setCreatedAt(new \DateTimeImmutable());
        $contactMessage->setStatus('nouveau');

        $em->persist($contactMessage);
        $em->flush();

        // J'utilise l'adresse autorisée par mon compte Brevo comme expéditeur officiel
        $email = (new Email())
            ->from('TON_ADRESSE_COMPTE@brevo.com') // ⚠️ À REMPLACER PAR TON EMAIL BREVO
            ->replyTo($emailAddress) // Je permets à l'admin de répondre directement au visiteur
            ->to('anonymous7649863275@gmail.com')
            ->subject('NOUVELLE DEMANDE ASSISTANCE - ' . $sujet)
            ->text("Message envoyé par : " . $emailAddress . "\n\n" . $messageContent);

        $mailer->send($email);

        return new JsonResponse(['status' => 'success']);
    }
}
