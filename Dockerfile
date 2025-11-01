FROM node:20-alpine AS builder
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm install --only=production
RUN npm install prisma --save-dev
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma ./prisma

RUN apk add --no-cache curl

EXPOSE 3333
CMD ["sh", "-c", "npm run db:deploy && npm run start:prod"]