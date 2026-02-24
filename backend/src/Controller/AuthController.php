// Je traduis ta logique d'inscription PHP en logique Symfony
public function register(Request $request, UserPasswordHasherInterface $passwordHasher) {
    $data = json_decode($request->getContent(), true);

    // Je vérifie l'âge comme dans ton fichier PHP original
    $birthDate = new \DateTime($data['date_naissance']);
    $age = $birthDate->diff(new \DateTime())->y;

    if ($age < 18) {
        return new JsonResponse(['error' => 'Vous devez être majeur'], 400);
    }

    // Je hache le mot de passe de manière sécurisée (au lieu du password_hash manuel)
    $user = new User();
    $user->setNom($data['identifiant']);
    $user->setPassword($passwordHasher->hashPassword($user, $data['mot_de_passe']));

    // ... sauvegarde via Doctrine
}
