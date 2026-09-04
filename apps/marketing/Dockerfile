FROM node:22-alpine AS build
RUN corepack enable
WORKDIR /app
COPY . .
RUN pnpm install --no-frozen-lockfile
ARG NEXT_PUBLIC_WEB_URL=http://localhost:5173
ENV NEXT_PUBLIC_WEB_URL=$NEXT_PUBLIC_WEB_URL
RUN pnpm --filter @foundry/marketing build
FROM nginx:1.27-alpine
COPY --from=build /app/apps/marketing/out /usr/share/nginx/html
EXPOSE 80
