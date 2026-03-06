# Environment Configuration

Local development requires a `.env` file based on `.env.example`.

Environment variables define all runtime configuration, including database
connections, secrets, and service endpoints.

Production environments must inject configuration via the runtime environment
and must not rely on committed files.
