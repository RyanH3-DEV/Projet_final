<?php

namespace App\Controller\Admin;

use App\Entity\SiteContent;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\ChoiceField;
use EasyCorp\Bundle\EasyAdminBundle\Field\ImageField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextEditorField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;

class SiteContentCrudController extends AbstractCrudController
{
    public static function getEntityFqcn(): string
    {
        return SiteContent::class;
    }

    public function configureFields(string $pageName): iterable
    {
        // Je définis la clé unique pour React (ex: chatbot_prompt)
        yield TextField::new('identifier', 'Identifiant (Clé)');

        // Je permets de choisir le type pour savoir quoi remplir
        yield ChoiceField::new('contentType', 'Type de contenu')
            ->setChoices([
                'Texte' => 'text',
                'Image' => 'image',
            ]);

        // Je mets un éditeur pour les textes longs
        yield TextEditorField::new('textContent', 'Contenu Texte')
            ->hideOnIndex(); // Je le cache de la liste principale pour gagner de la place

        // Je configure l'upload des images vers le dossier public
        yield ImageField::new('imagePath', 'Fichier Image')
            ->setBasePath('uploads/contents/')
            ->setUploadDir('public/uploads/contents/')
            ->setUploadedFileNamePattern('[randomhash].[extension]')
            ->setRequired(false);
    }
}
