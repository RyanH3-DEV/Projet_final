FROM php:8.4-cli

# J'installe les extensions pour que PHP puisse parler à MySQL
RUN apt-get update && apt-get install -y \
    libzip-dev \
    zip \
    && docker-php-ext-install pdo_mysql zip

# J'installe Composer à l'intérieur de Docker
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html
COPY . .

# Je lance le serveur Symfony sur le port 8000
CMD ["php", "-S", "0.0.0.0:8000", "-t", "public"]
