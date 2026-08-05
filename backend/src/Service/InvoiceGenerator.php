<?php

namespace App\Service;

use App\Entity\Order;
use Dompdf\Dompdf;
use Dompdf\Options;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Twig\Environment;

class InvoiceGenerator
{
    public function __construct(
        private Environment $twig,
        private ParameterBagInterface $params
    ) {}

    public function generate(Order $order): string
    {
        $pdfOptions = new Options();
        $pdfOptions->set('defaultFont', 'Arial');
        $pdfOptions->set('isRemoteEnabled', true);

        $dompdf = new Dompdf($pdfOptions);

        $html = $this->twig->render('pdf/invoice.html.twig', [
            'order' => $order,
            'user'  => $order->getUser(),
        ]);

        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();

        $output = $dompdf->output();

        $fileName = 'facture_' . $order->getId() . '_' . uniqid() . '.pdf';
        $publicDirectory = $this->params->get('kernel.project_dir') . '/public/uploads/invoices';

        if (!is_dir($publicDirectory)) {
            mkdir($publicDirectory, 0777, true);
        }

        $filePath = $publicDirectory . '/' . $fileName;
        file_put_contents($filePath, $output);

        return $fileName;
    }
}
