<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Component\Routing\Annotation\Route;

class MailController extends AbstractController
{
    #[Route('/api/contact-assistance', name: 'api_contact', methods: ['POST'])]
    public function support(Request $request, MailerInterface $mailer): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $email = (new Email())
            ->from($data['email'])
            ->to('anonymous7649863275@gmail.com')
            ->subject('NOUVELLE DEMANDE ASSISTANCE - ' . $data['nom'])
            ->text($data['message']);

        $mailer->send($email);
        return new JsonResponse(['status' => 'success']);
    }
}
