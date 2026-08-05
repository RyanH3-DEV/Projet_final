<?php

namespace App\Command;

use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;

#[AsCommand(
    name: 'app:send-automated-newsletter',
    description: 'Envoie un e-mail automatique tous les 3 jours aux abonnés.',
)]
class SendNewsletterCommand extends Command
{
    private EntityManagerInterface $em;
    private UserRepository $userRepo;
    private MailerInterface $mailer;

    public function __construct(EntityManagerInterface $em, UserRepository $userRepo, MailerInterface $mailer)
    {
        parent::__construct();
        $this->em = $em;
        $this->userRepo = $userRepo;
        $this->mailer = $mailer;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        // On calcule la date d'il y a 3 jours
        $threeDaysAgo = new \DateTimeImmutable('-3 days');

        // On cherche les abonnés (newsletter = 1)
        $subscribers = $this->userRepo->findBy(['newsletter' => true]);
        $frontendUrl = $_ENV['FRONTEND_URL'] ?? 'http://localhost:5173';
        $sentCount = 0;

        foreach ($subscribers as $user) {
            $lastSent = $user->getLastNewsletterSentAt();

            // Si le dernier mail date d'il y a PLUS de 3 jours, OU s'il n'a jamais rien reçu
            if ($lastSent === null || $lastSent <= $threeDaysAgo) {

                // Le lien de désabonnement unique
                $unsubLink = "{$frontendUrl}/desabonnement?token=" . $user->getUnsubscribeToken();

                $email = (new Email())
                    ->from('r.sebbouh@h3hitema.fr')
                    ->to($user->getEmail())
                    ->subject('Vos actualités Cybersécurité Cyna')
                    ->html("
                        <h2>Bonjour {$user->getPrenom()},</h2>
                        <p>Voici votre conseil sécurité du jour...</p>
                        <br><hr>
                        <p style='font-size: 12px; color: gray;'>
                            Vous recevez cet e-mail car vous êtes inscrit à la newsletter Cyna.<br>
                            <a href='{$unsubLink}'>Cliquez ici pour vous désabonner</a>.
                        </p>
                    ");

                try {
                    $this->mailer->send($email);

                    // On met à jour la date d'envoi pour relancer le compteur de 3 jours
                    $user->setLastNewsletterSentAt(new \DateTimeImmutable());
                    $this->em->persist($user);
                    $sentCount++;

                } catch (\Exception $e) {
                    $output->writeln("Erreur pour {$user->getEmail()} : " . $e->getMessage());
                }
            }
        }

        $this->em->flush();
        $output->writeln("Termine. $sentCount mails envoyes aujourd'hui.");

        return Command::SUCCESS;
    }
}
