# 构建阶段
FROM node:22-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 运行阶段
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# 代理 API 请求到 backend
RUN echo 'server { \
    listen 80; \
    location / { \
      root /usr/share/nginx/html; \
      try_files $uri $uri/ /index.html; \
    } \
    location /api/ { \
      proxy_pass http://backend:3000; \
      proxy_set_header Host $host; \
      proxy_set_header X-Real-IP $remote_addr; \
    } \
  }' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
