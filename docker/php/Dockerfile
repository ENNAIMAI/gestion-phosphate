FROM php:8.3-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libzip-dev \
    libjpeg-dev \
    libfreetype6-dev \
    supervisor \
    cron \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip opcache

# Install Redis extension via PECL
RUN pecl install redis && docker-php-ext-enable redis

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Copy PHP config and Supervisor config from root-relative paths
COPY docker/php/php.ini /usr/local/etc/php/conf.d/custom.ini
COPY docker/php/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Application files are bind-mounted at runtime via docker-compose

# Tune PHP-FPM to allow more concurrent requests
RUN echo "[www]\npm.max_children = 50\npm.start_servers = 10\npm.min_spare_servers = 5\npm.max_spare_servers = 20" > /usr/local/etc/php-fpm.d/zz-tune.conf

EXPOSE 9000

CMD ["php-fpm"]
