FROM node:18-alpine
WORKDIR /app
RUN npm install -g pnpm
COPY . .
RUN pnpm install
RUN cd artifacts/api-server && pnpm install && npx tsc
EXPOSE 3000
CMD ["node", "artifacts/api-server/dist/index.js"]
