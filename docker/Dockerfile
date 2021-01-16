FROM php:8.0-apache

# Install git
RUN apt-get update && apt-get install -y git libzip-dev unzip nano mariadb-client
RUN docker-php-ext-install pdo pdo_mysql zip

EXPOSE 80
