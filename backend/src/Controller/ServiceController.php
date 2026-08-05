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
        if ($request->getMethod() === 'OPTIONS') return new JsonResponse(null, 204);

        $categorie = $request->query->get('categorie');
        $search = $request->query->get('search');
        $minPrice = $request->query->get('minPrice');
        $maxPrice = $request->query->get('maxPrice');
        $sortBy = $request->query->get('sortBy', 'priority'); // par défaut : priorité

        $queryBuilder = $serviceRepo->createQueryBuilder('s');

        // Filtre Catégorie
        if ($categorie && $categorie !== 'tous') {
            $queryBuilder->andWhere('s.category = :cat')->setParameter('cat', $categorie);
        }

        // Filtre Recherche textuelle
        if ($search) {
            $queryBuilder->andWhere('s.name LIKE :search OR s.description LIKE :search')
                         ->setParameter('search', '%' . $search . '%');
        }

        // Filtre Prix
        if ($minPrice !== null && $minPrice !== '') {
            $queryBuilder->andWhere('s.price >= :min')->setParameter('min', (float)$minPrice);
        }
        if ($maxPrice !== null && $maxPrice !== '') {
            $queryBuilder->andWhere('s.price <= :max')->setParameter('max', (float)$maxPrice);
        }

        // Logique de Tri (Ticket 32)
        switch ($sortBy) {
            case 'price_asc': $queryBuilder->orderBy('s.price', 'ASC'); break;
            case 'price_desc': $queryBuilder->orderBy('s.price', 'DESC'); break;
            case 'newest': $queryBuilder->orderBy('s.createdAt', 'DESC'); break;
            default: $queryBuilder->orderBy('s.priority', 'DESC')->addOrderBy('s.isAvailable', 'DESC');
        }

        $queryBuilder->leftJoin('s.images', 'img')->addSelect('img');
        $services = $queryBuilder->getQuery()->getResult();

        $data = array_map(fn(ServiceSaas $s) => [
            'id' => $s->getId(),
            'name' => $s->getName(),
            'description' => $s->getDescription(),
            'price' => $s->getPrice(),
            'image' => $s->getImage(),
            'category' => $s->getCategory(),
            'isAvailable' => $s->isAvailable(),
            'createdAt' => $s->getCreatedAt()->format('c'),
            'images' => array_map(fn($img) => 'http://127.0.0.1:8000/uploads/services/' . $img->getImageName(), $s->getImages()->toArray()),
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
            'images'         => array_map(fn($img) => 'http://127.0.0.1:8000/uploads/services/' . $img->getImageName(), $service->getImages()->toArray()),
        ]);
    }
}
