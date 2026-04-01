#!/bin/bash
# BRASS Study - Full Deployment Script
# Run this on the VPS after uploading the app files to /var/www/brass-study/

set -e

APP_DIR="/var/www/brass-study"

echo "=== Deploying BRASS Study Application ==="

# 1. Install backend dependencies and set up env
echo "--- Setting up Backend ---"
cd $APP_DIR/backend
cp /var/www/brass-study/deploy/backend.env .env
npm install --production
npm run build 2>/dev/null || true  # Already built, but just in case

# 2. Install frontend dependencies and set up env
echo "--- Setting up Frontend ---"
cd $APP_DIR/frontend
cp /var/www/brass-study/deploy/frontend.env .env.local
npm install --production
npx next build

# 3. Set up Nginx
echo "--- Configuring Nginx ---"
cp $APP_DIR/deploy/nginx-brass-study.conf /etc/nginx/sites-available/brassphdstudy.com
ln -sf /etc/nginx/sites-available/brassphdstudy.com /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test nginx config (without SSL first - we'll add it after)
# Create a temp config without SSL for initial setup
cat > /etc/nginx/sites-available/brassphdstudy.com << 'NGINX'
server {
    listen 80;
    server_name brassphdstudy.com www.brassphdstudy.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        client_max_body_size 10M;
    }
}
NGINX

nginx -t && systemctl reload nginx

# 4. Start apps with PM2
echo "--- Starting Applications with PM2 ---"
cd $APP_DIR
cp deploy/ecosystem.config.js .
pm2 delete all 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u root --hp /root 2>/dev/null || true

# 5. Wait for apps to start
echo "--- Waiting for apps to start ---"
sleep 10

# 6. Seed test users
echo "--- Seeding test users ---"
curl -s -X POST http://localhost:3001/api/seed/test-users -H "Content-Type: application/json" || true

# 7. Get SSL certificate
echo "--- Setting up SSL ---"
certbot --nginx -d brassphdstudy.com -d www.brassphdstudy.com --non-interactive --agree-tos --email Sandybrass9032@gmail.com || echo "SSL setup may need manual intervention"

# 8. Now copy the full SSL nginx config
cp $APP_DIR/deploy/nginx-brass-study.conf /etc/nginx/sites-available/brassphdstudy.com
nginx -t && systemctl reload nginx

# 9. Set up auto-renewal
echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -

echo ""
echo "=== Deployment Complete ==="
echo "Frontend: https://brassphdstudy.com"
echo "Backend API: https://brassphdstudy.com/api/"
echo ""
echo "Test accounts:"
echo "  Researcher: researcher@test.com / Researcher123!"
echo "  Participant: participant@test.com / Participant123!"
echo ""
echo "PM2 status:"
pm2 status
