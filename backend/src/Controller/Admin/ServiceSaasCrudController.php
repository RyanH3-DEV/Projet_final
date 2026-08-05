<?php

namespace App\Controller\Admin;

use App\Entity\ServiceSaas;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\IdField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextEditorField;
use EasyCorp\Bundle\EasyAdminBundle\Field\NumberField;
use EasyCorp\Bundle\EasyAdminBundle\Field\ChoiceField;
use EasyCorp\Bundle\EasyAdminBundle\Field\BooleanField;
use EasyCorp\Bundle\EasyAdminBundle\Field\ImageField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextareaField;

use EasyCorp\Bundle\EasyAdminBundle\Field\CollectionField;
use App\Form\ServiceImageType;

class ServiceSaasCrudController extends AbstractCrudController
{
    public static function getEntityFqcn(): string
    {
        return ServiceSaas::class;
    }

    public function configureFields(string $pageName): iterable
    {
        return [
            IdField::new('id')->hideOnForm(),

            TextField::new('name', 'Nom de la solution'),

            ChoiceField::new('category', 'Catégorie')->setChoices([
                'EDR' => 'edr',
                'XDR' => 'xdr',
                'SOC' => 'soc',
            ]),

            NumberField::new('price', 'Prix mensuel (€)')
                ->setNumDecimals(2),

            ImageField::new('image', 'Image de couverture')
                ->setBasePath('/uploads/services')
                ->setUploadDir('public/uploads/services')
                ->setUploadedFileNamePattern('[randomhash].[extension]')
                ->setRequired(false),

            CollectionField::new('images', 'Galerie d\'images additionnelles')
                ->setEntryType(ServiceImageType::class)
                ->allowAdd()
                ->allowDelete()
                ->setEntryIsComplex(true),

            TextEditorField::new('description', 'Description'),

            TextareaField::new('technicalSpecs', 'Spécifications Techniques'),

            BooleanField::new('isAvailable', 'Disponible à la vente')
                ->renderAsSwitch(false),
        ];
    }
}
