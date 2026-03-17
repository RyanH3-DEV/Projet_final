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

        // Je récupère les champs spécifiés dans le cahier des charges
        $emailAddress = $data['email'] ?? null;
        $sujet = $data['sujet'] ?? 'Sans sujet';
        $messageContent = $data['message'] ?? '';

        if (!$emailAddress || !$messageContent) {
            return new JsonResponse(['status' => 'error', 'message' => 'Email et message obligatoires.'], 400);
        }

        // J'enregistre le message en base pour qu'il soit visible depuis le backoffice
        $contactMessage = new ContactMessage();
        $contactMessage->setEmail($emailAddress);
        $contactMessage->setSubject($sujet);
        $contactMessage->setMessage($messageContent);
        $contactMessage->setCreatedAt(new \DateTimeImmutable());
        $contactMessage->setStatus('nouveau');

        $em->persist($contactMessage);
        $em->flush();

        // Je conserve l'envoi de l'e-mail de notification
        $email = (new Email())
            ->from($emailAddress)
            ->to('anonymous7649863275@gmail.com')
            ->subject('NOUVELLE DEMANDE ASSISTANCE - ' . $sujet)
            ->text($messageContent);

        $mailer->send($email);

        return new JsonResponse(['status' => 'success']);
    }
}
