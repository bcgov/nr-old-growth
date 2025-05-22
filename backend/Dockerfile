# Build - includes npm
FROM node:20-bookworm-slim@sha256:cb4abfbba7dfaa78e21ddf2a72a592e5f9ed36ccf98bdc8ad3ff945673d288c2 AS build

# Install packages, build and keep only prod packages
WORKDIR /app
COPY . ./
RUN npm ci --only=prod && \
    npm run build

# Deploy - has node, but not npm
FROM gcr.io/distroless/nodejs20-debian12:nonroot@sha256:34958092aa848dc0e037cd188136a3145ceee02229471d1d1eabffbeffe42250

# Set node to production
ENV NODE_ENV=production

# Copy from build stage
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

# Port and health check - mostly a convention, for readability
EXPOSE 3000
HEALTHCHECK --interval=35s --timeout=4s CMD curl -f http://localhost:3000/ || exit 1

# Start up command
USER nonroot
CMD ["--max-old-space-size=50", "/app/dist/main"]
