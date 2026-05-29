<?php

namespace App\Form;

use App\Entity\ServiceImage;
use EasyCorp\Bundle\EasyAdminBundle\Form\Type\FileUploadType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class ServiceImageType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('imageName', FileUploadType::class, [
                'label' => 'Image',
                'upload_dir' => 'public/uploads/services',
                // Je retire "_pattern" de cette ligne pour que Symfony la comprenne
                'upload_filename' => '[randomhash].[extension]',
                'required' => true,
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => ServiceImage::class,
        ]);
    }
}
