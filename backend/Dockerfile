# RedHat UBI 8 with nodejs 16
FROM registry.access.redhat.com/ubi8/ubi@sha256:70fc843d4eb70159799e065d2830726b884c93950f8891e263d6328af6141173
RUN dnf module install -y nodejs:16

# Install packages, build and keep only prod packages
WORKDIR /app
COPY . ./
RUN npm ci --only=prod && \
    npm run build

# Set node to production 
ENV NODE_ENV production

# Expose port - mostly a convention, for readability
EXPOSE 3000

HEALTHCHECK --interval=35s --timeout=4s CMD curl -f http://localhost:3000/ || exit 1

USER app

# Start up command
ENTRYPOINT ["node", "dist/main"]
