FROM postgres:18

# Install older postgresql binaries to enable seamless in-place zero-data-loss upgrades
RUN apt-get update \
    && apt-get install -y --no-install-recommends postgresql-12 postgresql-13 \
    && rm -rf /var/lib/apt/lists/*

COPY upgrade-and-run.sh /usr/local/bin/upgrade-and-run.sh
RUN chmod +x /usr/local/bin/upgrade-and-run.sh

HEALTHCHECK --interval=35s --timeout=4s CMD pg_isready

ENTRYPOINT ["/usr/local/bin/upgrade-and-run.sh"]

# Non-privileged user
USER postgres
