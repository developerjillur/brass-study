#!/bin/bash
# BRASS Study - VPS Server Setup Script
# Run this on the Hostinger KVM 2 VPS as root

set -e

echo "=== BRASS Study Server Setup ==="

# Update system
apt update && apt upgrade -y

# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install MySQL 8
apt install -y mysql-server
systemctl start mysql
systemctl enable mysql

# Secure MySQL and create database
mysql -e "CREATE DATABASE IF NOT EXISTS brass_study CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -e "CREATE USER IF NOT EXISTS 'brass_app'@'localhost' IDENTIFIED BY 'BrassStudy2026!SecureDB';"
mysql -e "GRANT ALL PRIVILEGES ON brass_study.* TO 'brass_app'@'localhost';"
mysql -e "FLUSH PRIVILEGES;"

# Install Nginx
apt install -y nginx
systemctl start nginx
systemctl enable nginx

# Install PM2 globally
npm install -g pm2

# Install Certbot for SSL
apt install -y certbot python3-certbot-nginx

# Create app directory
mkdir -p /var/www/brass-study/backend
mkdir -p /var/www/brass-study/frontend
mkdir -p /var/www/brass-study/uploads/lab-reports

# Set permissions
chown -R www-data:www-data /var/www/brass-study
chmod -R 755 /var/www/brass-study

echo "=== Base server setup complete ==="
echo "Next: Upload application files, configure Nginx, and set up SSL"
