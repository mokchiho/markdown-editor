FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV PORT=3000
ENV DB_PATH=/data/docs.db

# 创建数据目录
RUN mkdir -p /data

EXPOSE 3000

CMD ["node", "server.js"]
