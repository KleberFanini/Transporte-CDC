FROM node:20-alpine AS base

# Instalar dependências do sistema
RUN apk add --no-cache openssl

# Estágio de dependências
FROM base AS deps
WORKDIR /app

# Copiar arquivos
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependências
RUN npm ci --include=dev

# Gerar Prisma Client
RUN npx prisma generate

# Estágio de build
FROM base AS builder
WORKDIR /app

# Receber variáveis de ambiente durante o build
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build do Next.js
RUN npm run build

# Estágio de produção
FROM base AS runner
WORKDIR /app

# Receber variáveis de ambiente para o runtime
ARG DATABASE_URL
ARG JWT_SECRET
ARG NODE_ENV

ENV DATABASE_URL=$DATABASE_URL
ENV JWT_SECRET=$JWT_SECRET
ENV NODE_ENV=${NODE_ENV:-production}

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar arquivos necessários
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=deps /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=deps /app/node_modules/@prisma/client ./node_modules/@prisma/client

# Dar permissão para o usuário nextjs
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Apenas iniciar o servidor (db push deve ser feito manualmente)
CMD ["node", "server.js"]