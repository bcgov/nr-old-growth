# RedHat UBI 8 with nodejs 16
FROM registry.access.redhat.com/ubi8/ubi@sha256:8fea2399f44a9dfdfa18eec4e3e5d2e1d71f0a865dd1d5c66215a6d68ccafa8a
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
