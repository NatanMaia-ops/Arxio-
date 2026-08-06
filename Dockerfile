FROM node:24-slim AS base
WORKDIR /app
ENV SKIP_ENV_VALIDATION=1

COPY . .
RUN --mount=type=cache,target=/root/.npm npm install

ENV NODE_ENV=production
RUN cd apps/server && npm run build
RUN cd apps/web && npm run build

RUN cp -r packages/db/src/migrations apps/server/dist/migrations
RUN cp packages/db/src/rds-ca.pem apps/server/dist/rds-ca.pem

RUN mv apps/web/.next/standalone web-standalone && \
	cp -r apps/web/.next/static web-standalone/apps/web/.next/static && \
	cp -r apps/web/public web-standalone/apps/web/public

ENV SKIP_ENV_VALIDATION=
ENV PORT=3000
ENV WEB_PORT=3001

EXPOSE 3000

CMD ["node", "deploy/start.mjs"]
