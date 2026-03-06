<?php
namespace App\Command;

use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

#[AsCommand(name: 'app:promote-user')]
class PromoteUserCommand extends Command
{
    public function __construct(
        private UserRepository $userRepo,
        private EntityManagerInterface $em
    ) { parent::__construct(); }

    protected function configure(): void
    {
        $this->addArgument('email', InputArgument::REQUIRED, 'Email');
        $this->addArgument('role', InputArgument::OPTIONAL, 'Role', 'ROLE_ADMIN');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $user = $this->userRepo->findOneBy(['email' => $input->getArgument('email')]);
        if (!$user) { $output->writeln('<error>Utilisateur introuvable</error>'); return Command::FAILURE; }

        $user->setRoles([$input->getArgument('role')]);
        $this->em->flush();

        $output->writeln('<info>Role attribue avec succes !</info>');
        return Command::SUCCESS;
    }
}