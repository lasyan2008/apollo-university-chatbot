FROM node:18-alpine
WORKDIR /app
RUN npm install -g pnpm
COPY . .
RUN pnpm install --no-frozen-lockfile
RUN cd lib/api-zod && npx tsc --skipLibCheck || true
RUN cd artifacts/api-server && npx tsc --skipLibCheck || true
EXPOSE 3000
CMD ["node", "artifacts/api-server/dist/index.mjs"]
