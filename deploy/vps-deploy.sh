#!/bin/bash
set -e

echo "=== BRASS Study VPS Deployment ==="

# 1. Install Node.js 20 LTS
echo "--- Installing Node.js 20 ---"
if ! command -v node &>/dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
echo "Node: $(node --version)"
echo "NPM: $(npm --version)"

# 2. Install PM2
echo "--- Installing PM2 ---"
npm install -g pm2 2>/dev/null
echo "PM2: $(pm2 --version)"

# 3. Setup MySQL database
echo "--- Setting up MySQL database ---"
mysql -e "CREATE DATABASE IF NOT EXISTS brass_study CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null || true
mysql -e "CREATE USER IF NOT EXISTS 'brass_app'@'localhost' IDENTIFIED BY 'BrassStudy2026SecureDB';" 2>/dev/null || true
mysql -e "ALTER USER 'brass_app'@'localhost' IDENTIFIED BY 'BrassStudy2026SecureDB';" 2>/dev/null || true
mysql -e "GRANT ALL PRIVILEGES ON brass_study.* TO 'brass_app'@'localhost';" 2>/dev/null || true
mysql -e "FLUSH PRIVILEGES;" 2>/dev/null || true
echo "MySQL database brass_study created"

# 4. Create app directories
echo "--- Creating app directories ---"
mkdir -p /var/www/brass-study/backend
mkdir -p /var/www/brass-study/frontend
mkdir -p /var/www/brass-study/uploads/lab-reports
mkdir -p /var/www/brass-study/deploy

echo "=== Base setup complete ==="
