# Build - includes npm
FROM node:20-bookworm-slim@sha256:c0f6fd9ba02e2138460fb5a38711b0942d5db2c530870458db10a4529e8b568c AS build

# Install packages, build and keep only prod packages
WORKDIR /app
COPY . ./
RUN npm ci --only=prod && \
    npm run build

# Deploy - has node, but not npm
FROM gcr.io/distroless/nodejs20-debian12:nonroot@sha256:728328cd0146c959dbb3f4e8cd20123aef1c2e977e46ec40a4b84b5296872bfc

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
