# Lightkeeper Service

> Lightkeeper Service is a full-stack performance auditing platform that runs Google Lighthouse audits, stores results in MongoDB, and provides a Next.js dashboard to visualize historical performance trends.

---

## Features

- Run Lighthouse audits (Performance, Accessibility, Best Practices, SEO, PWA) via the backend
- Persist audit results and detailed metrics into MongoDB
- Next.js Dashboard UI to view audits, drill into results, and visualize trends over time
- Dockerized: run the full stack (frontend, backend, database) with a single command

## Tech Stack

- Backend: FastAPI (Python)
- Lighthouse CLI (Node.js, invoked from the backend)
- Database: MongoDB (Motor async driver)
- Frontend: Next.js (React)
- Infrastructure: Docker & Docker Compose

## Architecture

Dashboard (Next.js) → FastAPI Backend → Lighthouse CLI → MongoDB

- The Next.js dashboard (port 3000) calls the FastAPI REST API (port 8000).
- The backend runs Lighthouse (Node/Chrome) to perform audits and then stores results in MongoDB.

## Prerequisites

- Docker
- Docker Compose

Note: Lighthouse requires Chrome/Chromium when run locally. This repository ships a Docker setup which includes the necessary components.

## Getting Started (Docker)

1. Clone the repository:

```bash
git clone <your-repo-url>
cd lightkeeper-service
```

2. Build and start all services with Docker Compose:

```bash
docker compose up --build
```

3. Open the Dashboard in your browser:

- Dashboard: http://localhost:3000
- Backend API (docs): http://localhost:8000/docs

Use the UI to run audits and explore historical results.

## Development (local, without Docker)

If you'd rather run services locally without Docker, follow these high-level steps (you may need to adapt paths and install versions used in the project):

1. Install Python 3.10+ and create a virtual environment.
2. Install Python dependencies: `pip install -r requirements.txt`.
3. Install Node.js (for Lighthouse) and npm dependencies used by the dashboard and any CLI wrappers.
4. Start MongoDB (local or remote) and configure connection string in `app/core/config.py` or environment variables.
5. Run the backend API (`uvicorn app.main:app --reload --port 8000`).
6. Run the Next.js dashboard (`cd dashboard && npm install && npm run dev`).

The Docker Compose setup is recommended for an easier, reproducible experience.

## Using the Service

- From the dashboard UI: run an audit by entering a target URL.
- From the backend: call the REST endpoints (see API docs at `/docs`) to schedule or trigger audits programmatically.

Example: Trigger an audit (replace with a real endpoint if available):

```bash
curl -X POST "http://localhost:8000/audits" \
	-H "Content-Type: application/json" \
	-d '{"url": "https://example.com"}'
```

Stored audit documents include summary scores (Performance, Accessibility, Best Practices, SEO), raw Lighthouse metrics, and timestamp metadata to enable trend analysis.

## Logs and Data

- Application logs are written to `logs/app.log` by default.
- MongoDB persists audit documents in the configured database; check the `audits` and `pages` folders for schema details.

## Future Enhancements (Planned)

- Scheduled recurring audits (cron/worker)
- Authentication & multi-user support
- Advanced charts and export options
- Multi-device and network condition auditing

## Contributing

Contributions are welcome. Suggested workflow:

1. Fork the repository.
2. Create a feature branch.
3. Add tests / documentation for your change.
4. Open a pull request with a clear description of the change.

Please follow the existing code style and add small, focused commits.

## License

Specify a license for the project (e.g., MIT). Add a `LICENSE` file to the repo.

---

If you'd like, I can also:

- Add a short `docker-compose` quick reference to this README
- Add a small troubleshooting section for common local issues (Chrome sandbox, permissions)
- Generate a minimal `LICENSE` file (MIT) and a PR-ready commit

Let me know which of those you'd like next.

