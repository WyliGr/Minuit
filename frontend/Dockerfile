FROM node:22-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Resolve the backend hostname at request time (inside location) instead of
# at nginx startup — avoids a race where nginx boots before the backend
# container is DNS-resolvable and exits with "host not found in upstream".
RUN <<'EOF'
cat > /etc/nginx/conf.d/default.conf <<'NGINX'
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location /api/ {
        resolver 127.0.0.11 valid=10s;
        set $backend_upstream http://backend:3333;
        proxy_pass $backend_upstream;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
NGINX
EOF

EXPOSE 80