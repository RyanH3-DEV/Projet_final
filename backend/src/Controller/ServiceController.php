<?php

namespace App\Controller;

use App\Entity\ServiceSaas;
use App\Repository\ServiceSaasRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/services', name: 'api_services_')]
class ServiceController extends AbstractController
{
    #[Route('', name: 'index', methods: ['GET', 'OPTIONS'])]
    public function index(Request $request, ServiceSaasRepository $serviceRepo): JsonResponse
    {
        // Gestion du CORS pour le mode OPTIONS
        if ($request->getMethod() === 'OPTIONS') {
            return new JsonResponse(null, 204);
        }

        $categorie = $request->query->get('categorie');
        $search = $request->query->get('search');

        // Je crée une requête personnalisée selon les filtres reçus
        $queryBuilder = $serviceRepo->createQueryBuilder('s');

        if ($categorie && $categorie !== 'tous') {
            $queryBuilder->andWhere('s.category = :cat')
                         ->setParameter('cat', $categorie);
        }

        if ($search) {
            $queryBuilder->andWhere('s.name LIKE :search OR s.description LIKE :search')
                         ->setParameter('search', '%' . $search . '%');
        }

        // Je respecte la priorité d'affichage demandée par le cahier des charges
        $queryBuilder->orderBy('s.priority', 'DESC')
                     ->addOrderBy('s.isAvailable', 'DESC');

        $services = $queryBuilder->getQuery()->getResult();

        $data = array_map(fn(ServiceSaas $s) => [
            'id'             => $s->getId(),
            'name'           => $s->getName(),
            'description'    => $s->getDescription(),
            'technicalSpecs' => $s->getTechnicalSpecs(),
            'price'          => $s->getPrice(),
            'image'          => $s->getImage(),
            'isAvailable'    => $s->isAvailable(),
            'category'       => $s->getCategory(),
        ], $services);

        return $this->json($data);
    }

    #[Route('/{id}', name: 'show', methods: ['GET', 'OPTIONS'])]
    public function show(int $id, ServiceSaasRepository $serviceRepo): JsonResponse
    {
        $service = $serviceRepo->find($id);

        if (!$service) {
            return $this->json(['message' => 'Service introuvable'], 404);
        }

        return $this->json([
            'id'             => $service->getId(),
            'name'           => $service->getName(),
            'description'    => $service->getDescription(),
            'technicalSpecs' => $service->getTechnicalSpecs(),
            'price'          => $service->getPrice(),
            'image'          => $service->getImage(),
            'isAvailable'    => $service->isAvailable(),
            'category'       => $service->getCategory(),
        ]);
    }
}
