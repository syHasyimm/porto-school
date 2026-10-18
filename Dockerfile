# syntax=docker/dockerfile:1

FROM composer:2 AS composer
FROM node:24-bookworm-slim AS node

FROM php:8.4-apache-bookworm AS php-base

WORKDIR /var/www/html

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        libicu-dev \
        libonig-dev \
        libpq-dev \
        libsqlite3-dev \
        libzip-dev \
        unzip \
    && docker-php-ext-install -j"$(nproc)" \
        bcmath intl mbstring opcache pcntl pdo_mysql pdo_pgsql pdo_sqlite zip \
    && a2enmod rewrite \
    && cp "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini" \
    && rm -rf /var/lib/apt/lists/*

COPY <<'APACHE' /etc/apache2/sites-available/000-default.conf
<VirtualHost *:80>
    DocumentRoot /var/www/html/public

    <Directory /var/www/html/public>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog /proc/self/fd/2
    CustomLog /proc/self/fd/1 combined
</VirtualHost>
APACHE

COPY <<'PHPINI' /usr/local/etc/php/conf.d/app.ini
expose_php = Off
memory_limit = 256M
upload_max_filesize = 20M
post_max_size = 25M
opcache.enable = 1
opcache.validate_timestamps = 0
PHPINI

FROM php-base AS dependencies

ENV COMPOSER_ALLOW_SUPERUSER=1

COPY --from=composer /usr/bin/composer /usr/local/bin/composer
COPY composer.json composer.lock ./

RUN composer install --no-dev --prefer-dist --no-interaction --no-progress \
    --no-scripts --no-autoloader

COPY . .

RUN mkdir -p bootstrap/cache storage/framework/views \
    && composer dump-autoload --no-dev --optimize --no-interaction \
    && composer check-platform-reqs --no-dev

FROM php-base AS frontend

# Wayfinder's Vite plugin invokes Artisan during the frontend build.
COPY --from=node /usr/local/ /usr/local/
COPY package.json package-lock.json ./

RUN npm ci --no-audit --no-fund

COPY --from=dependencies /var/www/html/ ./

ARG VITE_APP_NAME="SD Negeri 001 Kepenuhan"

RUN npm run build

FROM php-base AS production

ENV APP_ENV=production \
    APP_DEBUG=false \
    LOG_CHANNEL=stderr \
    LOG_LEVEL=info \
    DB_CONNECTION=sqlite \
    DB_DATABASE=/var/www/html/storage/database.sqlite

COPY --from=dependencies /var/www/html/ ./
COPY --from=frontend /var/www/html/public/build/ ./public/build/

COPY --chmod=755 <<'ENTRYPOINT' /usr/local/bin/app-entrypoint
#!/bin/sh
set -eu

mkdir -p storage/app/private storage/app/public storage/framework/cache/data \
    storage/framework/sessions storage/framework/views storage/logs bootstrap/cache

if [ "${DB_CONNECTION}" = "sqlite" ] && [ "${DB_DATABASE}" != ":memory:" ]; then
    mkdir -p "$(dirname "${DB_DATABASE}")"
    touch "${DB_DATABASE}"
    chown www-data:www-data "$(dirname "${DB_DATABASE}")" "${DB_DATABASE}"
fi

chown -R www-data:www-data storage bootstrap/cache

if [ ! -L public/storage ]; then
    php artisan storage:link --no-interaction
fi

exec docker-php-entrypoint "$@"
ENTRYPOINT

EXPOSE 80

ENTRYPOINT ["app-entrypoint"]
CMD ["apache2-foreground"]
