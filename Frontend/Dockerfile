# frontend/Dockerfile
# Stage 1: Build Next.js app
FROM node:latest AS builder

WORKDIR /app
COPY ./ /app
RUN npm install
RUN npm run build

# Production image
FROM node:alpine

WORKDIR /app
COPY --from=builder /app/.next /app/.next 
COPY --from=builder /app/public /app/public
COPY ./package.json ./package-lock.json /app/ 
RUN npm install --only=production

EXPOSE 3000

CMD ["npm", "start"]
