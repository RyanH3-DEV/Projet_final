<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260316164839 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE address (id INT AUTO_INCREMENT NOT NULL, prenom VARCHAR(255) NOT NULL, nom VARCHAR(255) NOT NULL, adresse1 VARCHAR(255) NOT NULL, adresse2 VARCHAR(255) DEFAULT NULL, ville VARCHAR(255) NOT NULL, region VARCHAR(255) NOT NULL, code_postal VARCHAR(50) NOT NULL, pays VARCHAR(100) NOT NULL, telephone VARCHAR(50) NOT NULL, user_id INT NOT NULL, INDEX IDX_D4E6F81A76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE contact_message (id INT AUTO_INCREMENT NOT NULL, email VARCHAR(255) NOT NULL, subject VARCHAR(255) NOT NULL, message LONGTEXT NOT NULL, created_at DATETIME NOT NULL, status VARCHAR(50) NOT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE service_saas (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(255) NOT NULL, description LONGTEXT NOT NULL, technical_specs LONGTEXT NOT NULL, price DOUBLE PRECISION NOT NULL, image VARCHAR(255) DEFAULT NULL, is_available TINYINT NOT NULL, category VARCHAR(100) NOT NULL, priority INT NOT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE address ADD CONSTRAINT FK_D4E6F81A76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id)');
        $this->addSql('DROP TABLE livre');
        $this->addSql('ALTER TABLE cart_item DROP FOREIGN KEY `FK_F0FE252737D925CB`');
        $this->addSql('DROP INDEX IDX_F0FE252737D925CB ON cart_item');
        $this->addSql('ALTER TABLE cart_item ADD subscription_duration VARCHAR(50) NOT NULL, CHANGE livre_id service_saas_id INT NOT NULL');
        $this->addSql('ALTER TABLE cart_item ADD CONSTRAINT FK_F0FE2527818D606 FOREIGN KEY (service_saas_id) REFERENCES service_saas (id)');
        $this->addSql('CREATE INDEX IDX_F0FE2527818D606 ON cart_item (service_saas_id)');
        $this->addSql('ALTER TABLE `order` ADD billing_address LONGTEXT NOT NULL, ADD invoice_path VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE order_item ADD subscription_duration VARCHAR(50) NOT NULL, CHANGE title service_name VARCHAR(255) NOT NULL');
        $this->addSql('ALTER TABLE wishlist DROP FOREIGN KEY `FK_9CE12A3137D925CB`');
        $this->addSql('DROP INDEX IDX_9CE12A3137D925CB ON wishlist');
        $this->addSql('DROP INDEX unique_wishlist ON wishlist');
        $this->addSql('ALTER TABLE wishlist CHANGE livre_id service_saas_id INT NOT NULL');
        $this->addSql('ALTER TABLE wishlist ADD CONSTRAINT FK_9CE12A31818D606 FOREIGN KEY (service_saas_id) REFERENCES service_saas (id)');
        $this->addSql('CREATE INDEX IDX_9CE12A31818D606 ON wishlist (service_saas_id)');
        $this->addSql('CREATE UNIQUE INDEX unique_wishlist ON wishlist (user_id, service_saas_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE livre (id INT AUTO_INCREMENT NOT NULL, title VARCHAR(255) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_0900_ai_ci`, price DOUBLE PRECISION NOT NULL, image VARCHAR(255) CHARACTER SET utf8mb4 DEFAULT NULL COLLATE `utf8mb4_0900_ai_ci`, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_0900_ai_ci` ENGINE = InnoDB COMMENT = \'\' ');
        $this->addSql('ALTER TABLE address DROP FOREIGN KEY FK_D4E6F81A76ED395');
        $this->addSql('DROP TABLE address');
        $this->addSql('DROP TABLE contact_message');
        $this->addSql('DROP TABLE service_saas');
        $this->addSql('ALTER TABLE cart_item DROP FOREIGN KEY FK_F0FE2527818D606');
        $this->addSql('DROP INDEX IDX_F0FE2527818D606 ON cart_item');
        $this->addSql('ALTER TABLE cart_item DROP subscription_duration, CHANGE service_saas_id livre_id INT NOT NULL');
        $this->addSql('ALTER TABLE cart_item ADD CONSTRAINT `FK_F0FE252737D925CB` FOREIGN KEY (livre_id) REFERENCES livre (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
        $this->addSql('CREATE INDEX IDX_F0FE252737D925CB ON cart_item (livre_id)');
        $this->addSql('ALTER TABLE `order` DROP billing_address, DROP invoice_path');
        $this->addSql('ALTER TABLE order_item DROP subscription_duration, CHANGE service_name title VARCHAR(255) NOT NULL');
        $this->addSql('ALTER TABLE wishlist DROP FOREIGN KEY FK_9CE12A31818D606');
        $this->addSql('DROP INDEX IDX_9CE12A31818D606 ON wishlist');
        $this->addSql('DROP INDEX unique_wishlist ON wishlist');
        $this->addSql('ALTER TABLE wishlist CHANGE service_saas_id livre_id INT NOT NULL');
        $this->addSql('ALTER TABLE wishlist ADD CONSTRAINT `FK_9CE12A3137D925CB` FOREIGN KEY (livre_id) REFERENCES livre (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
        $this->addSql('CREATE INDEX IDX_9CE12A3137D925CB ON wishlist (livre_id)');
        $this->addSql('CREATE UNIQUE INDEX unique_wishlist ON wishlist (user_id, livre_id)');
    }
}
