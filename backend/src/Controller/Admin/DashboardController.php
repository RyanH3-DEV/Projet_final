<?php

namespace App\Controller\Admin;

use App\Controller\Admin\SiteContentCrudController;
use App\Controller\Admin\ServiceSaasCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Attribute\AdminDashboard;
use EasyCorp\Bundle\EasyAdminBundle\Config\Dashboard;
use EasyCorp\Bundle\EasyAdminBundle\Config\MenuItem;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractDashboardController;
use EasyCorp\Bundle\EasyAdminBundle\Router\AdminUrlGenerator;
use Symfony\Component\HttpFoundation\Response;

#[AdminDashboard(routePath: '/admin', routeName: 'admin')]
class DashboardController extends AbstractDashboardController
{
    public function index(): Response
    {
        // Je récupère le générateur d'URL
        $adminUrlGenerator = $this->container->get(AdminUrlGenerator::class);

        // Je crée l'URL exacte vers le catalogue et j'y redirige directement
        $url = $adminUrlGenerator->setController(ServiceSaasCrudController::class)->generateUrl();
        return $this->redirect($url);
    }

    public function configureDashboard(): Dashboard
    {
        return Dashboard::new()->setTitle('CYNA Admin');
    }

    public function configureMenuItems(): iterable
    {
        yield MenuItem::linkToDashboard('Dashboard', 'fa fa-home');

        // Je récupère l'outil interne d'EasyAdmin pour fabriquer des liens infaillibles
        $urlGenerator = $this->container->get(AdminUrlGenerator::class);

        // Je crée et j'associe l'URL pour les textes
        $urlTextes = $urlGenerator->setController(SiteContentCrudController::class)->generateUrl();
        yield MenuItem::linkToUrl('Textes du site', 'fa fa-file-text', $urlTextes);

        // Je crée et j'associe l'URL pour le catalogue SaaS
        $urlCatalogue = $urlGenerator->setController(ServiceSaasCrudController::class)->generateUrl();
        yield MenuItem::linkToUrl('Catalogue SaaS', 'fas fa-shield-alt', $urlCatalogue);
    }
}
