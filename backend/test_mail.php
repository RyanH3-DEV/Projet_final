<?php
require __DIR__.'/vendor/autoload.php';

use Symfony\Component\Mailer\Transport;
use Symfony\Component\Mailer\Mailer;
use Symfony\Component\Mime\Email;

$transport = Transport::fromDsn('smtp://a5801b001@smtp-brevo.com:2UOzV4XpW0nGfdvE@smtp-relay.brevo.com:587');
$mailer = new Mailer($transport);

$email = (new Email())
    ->from('no-reply@demomailtrap.com')
    ->to('ryansebbouh2@gmail.com')
    ->subject('Test Brevo')
    ->text('Test envoi Brevo !');

try {
    $mailer->send($email);
    echo "Email envoye !\n";
} catch (\Exception $e) {
    echo "Erreur : " . $e->getMessage() . "\n";
}
