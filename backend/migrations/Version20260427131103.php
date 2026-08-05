<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260427131103 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE service_image DROP FOREIGN KEY `FK_6C4FE9B8ED5CA9E6`');
        $this->addSql('ALTER TABLE service_image ADD CONSTRAINT FK_6C4FE9B8ED5CA9E6 FOREIGN KEY (service_id) REFERENCES service_saas (id)');
        $this->addSql('ALTER TABLE service_saas ADD created_at DATETIME NOT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE service_image DROP FOREIGN KEY FK_6C4FE9B8ED5CA9E6');
        $this->addSql('ALTER TABLE service_image ADD CONSTRAINT `FK_6C4FE9B8ED5CA9E6` FOREIGN KEY (service_id) REFERENCES service (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
        $this->addSql('ALTER TABLE service_saas DROP created_at');
    }
}
