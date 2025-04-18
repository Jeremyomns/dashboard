FROM node:18-alpine AS base
WORKDIR /app
COPY package.json ./
EXPOSE 3000

FROM base AS builder
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build


FROM base AS production
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package-lock.json .
RUN npm ci
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules .
COPY --from=builder /app/package.json .
COPY --from=builder /app/public .
ENTRYPOINT npm start

FROM base AS dev
ENV NODE_ENV=development
RUN npm install 
COPY . .
CMD npm run dev