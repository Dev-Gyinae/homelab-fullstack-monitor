# HomeStack — Full-Stack Monitoring Lab on Docker Swarm

> A production-grade, self-hosted infrastructure stack running on a single 2 GB VM — featuring a task management app, message queuing, search, container orchestration, and uptime monitoring. Built and automated with Ansible and Docker Swarm.

---

## Screenshots

<img width="1366" height="768" alt="images" src="https://github.com/user-attachments/assets/d5811545-55f7-4593-a47c-229f26e51f5c" />

- Docker Images



<img width="1366" height="768" alt="swarm_ans1" src="https://github.com/user-attachments/assets/03882412-e9e5-4eb9-9199-d86fd0e9d426" />
<img width="1366" height="768" alt="swarm_ans2" src="https://github.com/user-attachments/assets/e4a0158a-fb9e-411d-aca5-bb16caa3f40a" />

- Ansible setup

<img width="1366" height="768" alt="elastic_backend" src="https://github.com/user-attachments/assets/3455511a-875a-4ba2-bb33-a34b89bf9ba2" />

 - Elastic Search Backend API service

<img width="1366" height="768" alt="final_output" src="https://github.com/user-attachments/assets/7c1271c3-60e6-404b-bd8d-dedadb849da1" />
 
 - Swarmpit from the CLI

<img width="1366" height="768" alt="kuma_final" src="https://github.com/user-attachments/assets/730b9037-aca1-46f6-83bd-b355e75f7699" />
 
 - Uptime Kuma

<img width="1366" height="768" alt="Rabbit_cue" src="https://github.com/user-attachments/assets/4a402b9c-bd76-4da6-a61a-ef36f72a4517" />
 
 - Message Broker - RabbitMQ

<img width="1366" height="768" alt="swarm_networks" src="https://github.com/user-attachments/assets/7721a5f9-cd48-4bea-b4aa-c68ba52ca679" />
 
 - Networks from Swarm UI

<img width="1366" height="768" alt="swarmpit" src="https://github.com/user-attachments/assets/e7745335-a161-430c-a5f8-070ec1f9fb86" />

- Swarm UI with Services 

<img width="1366" height="768" alt="swarmpit_servicedetails" src="https://github.com/user-attachments/assets/82cf4266-cf3f-4deb-abf5-5601d40f9476" />

- Services troubleshooting

<img width="1366" height="768" alt="final" src="https://github.com/user-attachments/assets/3d03fdac-a1e1-4c4e-a5ec-e91b50c3f16f" />
<img width="1366" height="768" alt="final_output" src="https://github.com/user-attachments/assets/4bd56dd3-c4bc-46ed-a055-64dc1023a8c3" />

- Services after troubleshooting and restart

<img width="1366" height="768" alt="frontend_ui" src="https://github.com/user-attachments/assets/779bd1d3-2b82-439d-a679-38a5e72b3874" />

- Frontend UI
  
---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Services](#services)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Deployment](#deployment)
- [Accessing the Services](#accessing-the-services)
- [Infrastructure as Code (Ansible)](#infrastructure-as-code-ansible)
- [Key Challenges & Solutions](#key-challenges--solutions)
- [What I Learned](#what-i-learned)
- [Future Improvements](#future-improvements)

---

## Overview

**HomeStack** is a fully containerised, orchestrated home lab environment that demonstrates real-world DevOps patterns — service discovery, async task processing, full-text search, health monitoring, and infrastructure automation — all running on a resource-constrained 2 GB bare-metal VM.

The centrepiece is **TaskFlow**, a full-stack task management application. Supporting it is a suite of infrastructure services that mirror what you'd find in a professional production environment.

**Key highlights:**
- Single-node Docker Swarm cluster orchestrating 10 services
- Async background jobs via Celery + RabbitMQ
- Full-text search powered by Elasticsearch
- Real-time uptime monitoring with Uptime Kuma
- Swarm visualisation and management via Swarmpit
- Full infrastructure provisioning automated with Ansible

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Docker Swarm Node                        │
│                     (Ubuntu VM — 2 GB RAM)                      │
│                                                                 │
│  ┌──────────┐    ┌──────────┐    ┌──────────────────────────┐  │
│  │ Frontend │    │ Backend  │    │         Worker           │  │
│  │  React   │───▶│ FastAPI  │───▶│  Celery (async tasks)   │  │
│  │  :80     │    │  :8000   │    │                          │  │
│  └──────────┘    └────┬─────┘    └──────────────────────────┘  │
│                       │                                         │
│         ┌─────────────┼──────────────┐                         │
│         ▼             ▼              ▼                          │
│  ┌────────────┐ ┌──────────┐ ┌─────────────────┐              │
│  │ PostgreSQL │ │ RabbitMQ │ │  Elasticsearch  │              │
│  │   :5432    │ │  :5672   │ │     :9200       │              │
│  └────────────┘ └──────────┘ └─────────────────┘              │
│                                                                 │
│  ┌──────────────────┐   ┌──────────────┐   ┌───────────────┐  │
│  │    Swarmpit      │   │  Uptime Kuma │   │  Swarmpit DB  │  │
│  │  (Swarm UI :8888)│   │   :3001      │   │  (CouchDB)    │  │
│  └──────────────────┘   └──────────────┘   └───────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

**Request flow for task creation:**
1. User creates a task in the React frontend
2. FastAPI backend saves it to PostgreSQL and publishes a message to RabbitMQ
3. Celery worker picks up the message and indexes the task in Elasticsearch
4. Search queries hit Elasticsearch directly via the FastAPI backend

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React, Nginx |
| **Backend API** | FastAPI (Python) |
| **Async Worker** | Celery |
| **Message Broker** | RabbitMQ 3.13 |
| **Primary Database** | PostgreSQL 16 |
| **Search Engine** | Elasticsearch 8.12 |
| **Container Runtime** | Docker |
| **Orchestration** | Docker Swarm |
| **Swarm UI** | Swarmpit |
| **DB for Swarmpit** | CouchDB 2.3 |
| **Uptime Monitoring** | Uptime Kuma |
| **Automation / IaC** | Ansible |
| **Host OS** | Ubuntu (KVM VM) |

---

## Services

| Service | Image | Port | Purpose |
|---|---|---|---|
| `frontend` | `homelab-frontend:latest` | `80` | React task management UI |
| `backend` | `homelab-backend:latest` | `8000` | FastAPI REST API |
| `worker` | `homelab-worker:latest` | — | Celery background task processor |
| `postgres` | `postgres:16-alpine` | `5432` | Primary relational database |
| `rabbitmq` | `rabbitmq:3.13-management-alpine` | `5672`, `15672` | Message broker + management UI |
| `elasticsearch` | `elasticsearch:8.12.0` | `9200` | Full-text search engine |
| `uptime-kuma` | `louislam/uptime-kuma:latest` | `3001` | Service uptime monitoring |
| `swarmpit-app` | `swarmpit/swarmpit:latest` | `8888` | Docker Swarm management UI |
| `swarmpit-db` | `couchdb:2.3` | — | Swarmpit's internal database |
| `swarmpit-agent` | `swarmpit/agent:latest` | — | Swarm metrics agent (global mode) |

---

## Project Structure

```
homelab-fullstack-monitor/
├── ansible/
│   ├── inventory.ini          # Target host definitions
│   ├── playbook.yml           # Main provisioning playbook
│   └── roles/
│       ├── docker/            # Docker + Swarm setup
│       ├── deploy/            # Stack deployment
│       └── firewall/          # UFW rules
├── backend/
│   ├── Dockerfile
│   ├── main.py                # FastAPI application
│   ├── models.py              # SQLAlchemy models
│   ├── tasks.py               # Celery task definitions
│   └── requirements.txt
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── src/
│       └── App.jsx            # React task management UI
├── worker/
│   ├── Dockerfile
│   └── worker.py              # Celery worker entrypoint
├── docker-compose.yml         # Swarm stack definition
└── README.md
```

---

## Prerequisites

- Docker Engine (with Swarm mode enabled)
- Docker Compose v2+
- Ansible 2.12+ (for automated provisioning)
- A Linux host with at least 2 GB RAM

---

## Getting Started

### Option 1 — Manual deployment

**1. Clone the repository**
```bash
git clone https://github.com/Dev-Gyinae/homelab-fullstack-monitor.git
cd homelab-fullstack-monitor
```

**2. Initialise Docker Swarm**
```bash
docker swarm init
```

**3. Build the custom images**
```bash
docker build -t homelab-backend:latest ./backend
docker build -t homelab-frontend:latest ./frontend
docker build -t homelab-worker:latest ./worker
```

**4. Deploy the stack**
```bash
docker stack deploy -c docker-compose.yml homelab
```

**5. Verify all services are running**
```bash
docker service ls
```

You should see `1/1` replicas for all services.

---

### Option 2 — Automated with Ansible

```bash
cd ansible
ansible-playbook -i inventory.ini playbook.yml
```

The playbook handles: Docker installation, Swarm initialisation, image builds, and full stack deployment.

---

## Deployment

### Checking service status

```bash
docker service ls
docker service ps homelab_backend   # Inspect a specific service
docker service logs homelab_backend # View logs
```

### Updating a service

```bash
docker service update --image homelab-backend:latest homelab_backend
```

### Scaling a service

```bash
docker service scale homelab_backend=3
```

### Tearing down the stack

```bash
docker stack rm homelab
```

---

## Accessing the Services

Once deployed, open the following URLs in your browser:

| Service | URL | Credentials |
|---|---|---|
| **TaskFlow App** | `http://<HOST_IP>` | — |
| **Swarmpit** | `http://<HOST_IP>:8888` | `admin` / `admin123` |
| **RabbitMQ Management** | `http://<HOST_IP>:15672` | `admin` / `admin123` |
| **Uptime Kuma** | `http://<HOST_IP>:3001` | Create on first visit |
| **Elasticsearch API** | `http://<HOST_IP>:9200` | — |

> Replace `<HOST_IP>` with your VM or server IP address.

---

## Infrastructure as Code (Ansible)

The `ansible/` directory contains a complete Ansible playbook that provisions a fresh Ubuntu server from zero to a fully running stack:

| Role | What it does |
|---|---|
| `docker` | Installs Docker Engine, enables the daemon, initialises Swarm |
| `deploy` | Copies the project files, builds images, deploys the stack |
| `firewall` | Configures UFW to allow only necessary ports |

**Example inventory (`inventory.ini`):**
```ini
[homelab]
192.168.122.166 ansible_user=gyinae ansible_ssh_private_key_file=~/.ssh/id_rsa
```

---

## Key Challenges & Solutions

### 1. Healthcheck failures in Swarm mode

**Problem:** Docker Swarm services were stuck at `0/1` replicas. The healthcheck commands in `docker-compose.yml` used environment variable syntax (e.g., `${POSTGRES_USER}`), but Swarm does not expand shell variables inside healthcheck definitions the way Compose does in local mode. The literal string `pg_isready -U ${POSTGRES_USER}` was being executed and failing.

**Solution:** Used `docker service update --no-healthcheck <service>` to disable broken healthchecks at runtime without modifying the compose file. The services came up immediately. The proper fix is to hardcode the healthcheck values or use a shell wrapper script.

```bash
docker service update --no-healthcheck homelab_elasticsearch
docker service update --no-healthcheck homelab_rabbitmq
docker service update --no-healthcheck homelab_swarmpit-app
docker service update --no-healthcheck homelab_uptime-kuma
```

### 2. Resource constraints on a 2 GB VM

**Problem:** Running Elasticsearch (which defaults to 1 GB heap), PostgreSQL, RabbitMQ, and multiple custom services simultaneously on a 2 GB VM caused OOM pressure.

**Solution:** Tuned Elasticsearch's JVM heap via environment variables (`ES_JAVA_OPTS=-Xms256m -Xmx256m`) and set `discovery.type=single-node` to disable unnecessary cluster coordination overhead.

### 3. Rolling updates causing temporary downtime

**Problem:** Running `docker service update --no-healthcheck` on multiple services in sequence triggered rolling updates. Some previously healthy services (like `backend`) dropped to `0/1` while others were being restarted.

**Solution:** After all service updates, a full `docker stack deploy` re-converges the entire stack to its desired state cleanly.

---

## What I Learned

- **Docker Swarm vs Compose:** Swarm mode introduces differences in variable expansion, networking (overlay vs bridge), and service lifecycle that don't exist in plain Compose. Healthchecks that work locally may silently fail in Swarm.
- **Service orchestration debugging:** How to read `docker service ps` output to trace task history, identify failure reasons, and distinguish between scheduling failures and runtime crashes.
- **Async architecture:** Separating web request handling (FastAPI) from background processing (Celery + RabbitMQ) improves API response times and makes the system more resilient to processing spikes.
- **Infrastructure as Code mindset:** Encoding all provisioning steps in Ansible means the entire lab can be torn down and rebuilt repeatably — critical for a portfolio project that needs to be demonstrable.
- **Resource management:** Running a realistic production-grade stack on constrained hardware forces deliberate decisions about memory limits, image sizes, and which services are truly necessary.

---

## Future Improvements

- [ ] Add Traefik as a reverse proxy with TLS termination (HTTPS for all services)
- [ ] Set up a private Docker registry to avoid rebuilding images on each deploy
- [ ] Add Prometheus + Grafana for metrics dashboards
- [ ] Implement proper secrets management (Docker secrets instead of environment variables)
- [ ] Fix healthcheck definitions to work natively in Swarm mode
- [ ] Add multi-node Swarm support with manager/worker separation
- [ ] CI/CD pipeline (GitHub Actions) to auto-build and deploy on push

---

<p align="center">Built with ☕ and a lot of <code>docker service ls</code> commands.</p>
