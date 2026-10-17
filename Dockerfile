
# 1. Base image
FROM node:20-bookworm-slim

# 2. Cài OpenSSL cho Prisma
RUN apt-get update -y && apt-get install -y openssl \
    && rm -rf /var/lib/apt/lists/*

# 3. Tạo thư mục làm việc
WORKDIR /app

# 4. Copy package files
COPY package*.json ./

# 5. Cài dependencies
RUN npm ci

# 6. Copy mã nguồn
COPY . .

# 7. Sinh Prisma Client
RUN npx prisma generate

# 8. Mở cổng ứng dụng
EXPOSE 3000

# 9. Khởi chạy ứng dụng
CMD ["npm", "run", "dev"]
