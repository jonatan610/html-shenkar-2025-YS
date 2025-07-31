# TrackMe

![License](https://img.shields.io/badge/license-MIT-blue.svg) ![Node](https://img.shields.io/badge/Node.js-18.x-green) ![MongoDB](https://img.shields.io/badge/MongoDB-%5E6.0-brightgreen)

A full‑stack **job‑tracking platform** for Operations Managers and Couriers. TrackMe lets you create delivery jobs, assign couriers, follow real‑time status updates, upload documents and keep stakeholders in the loop – all from a modern web interface.

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Architecture Overview](#architecture-overview)
4. [Project Structure](#project-structure)
5. [Getting Started](#getting-started)
6. [Environment Variables](#environment-variables)
7. [Running the App](#running-the-app)
8. [API Reference](#api-reference)
9. [Frontend Usage](#frontend-usage)
10. [Testing](#testing)
11. [Deployment](#deployment)
12. [Contributing](#contributing)
13. [License](#license)
14. [Acknowledgements](#acknowledgements)
15. [Demo Credentials](#demo-credentials)

---

## Features

* **Unique Business IDs** – jobs follow the pattern `JOB-YYYY-XXXX`, never reused even after deletion.
* **Role‑based UX** – desktop Admin dashboard + mobile‑first Courier UI.
* **Real‑time Status** – couriers update each leg (Picked Up → En Route → On Flight → Landed → Delivered).
* **Document Centre** – upload PDFs, JPGs, PNGs or DOCX (≤ 10 MB) with drag‑and‑drop.
* **Google Maps Integration** – Places Autocomplete, geocoding & map previews.
* **International Phone Input** – powered by `intl‑tel‑input`.
* **RESTful API** – fully typed Mongoose models, Express routers, atomic counters.
* **Modular Frontend** – semantic HTML `<section>` blocks, pixel‑perfect Figma parity.

## Tech Stack

| Layer        | Tech                             |
| ------------ | -------------------------------- |
| **Frontend** | HTML 5 · CSS 3 · Vanilla JS      |
| **Backend**  | Node.js 18 · Express 4           |
| **Database** | MongoDB 6 · Mongoose ^7          |
| **Maps API** | Google Maps (Geocoding + Places) |
| **Uploads**  | Multer                           |
| **Auth**     | (optional) JWT‑based sessions    |
| **Testing**  | Jest · Supertest                 |

## Architecture Overview

```
┌───────────┐   REST/JSON   ┌──────────────┐
│ Frontend  │ ⇆  Express ⇆ │  MongoDB     │
│ (Admin &  │               │  (Jobs,      │
│  Courier) │               │  Couriers…)  │
└───────────┘               └──────────────┘
         ▲                          ▲
         │  Google Maps Geocoding   │ GridFS / Local
         └───────────⇆──────────────┘ (file uploads)
```

## Project Structure

```
TrackMe/
├── public/                 # Static client
│   ├── admin-dashboard.html
│   ├── courier-dashboard.html
│   ├── js/
│   │   ├── admin-dashboard.js
│   │   └── courier-activeJob.js
│   └── assets/
│       └── icons/
├── models/
│   ├── Job.js
│   ├── Courier.js
│   └── Counter.js
├── routes/
│   ├── jobs.js
│   └── couriers.js
├── controllers/
├── uploads/                # Saved files (Multer destination)
├── .env.example
├── server.js
└── package.json
```

## Getting Started

### Prerequisites

* **Node.js 18** (or later)
* **MongoDB 6** (local or Atlas)

### Installation

```bash
# Clone repository
$ git clone https://github.com/your‑org/TrackMe.git && cd TrackMe

# Install dependencies
$ npm install
```

## Environment Variables

Create a `.env` file at the project root (see `.env.example`).

```dotenv
PORT=5500
MONGO_URI=mongodb://localhost:27017/trackme
GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_KEY
JWT_SECRET=change‑me
UPLOAD_DIR=uploads
```

## Running the App

```bash
# Development (nodemon + concurrently serve public)
$ npm run dev

# Production
$ npm start
```

The server will start on `http://localhost:5500` by default. Static frontend files under `/public` are served automatically.

## API Reference

### Jobs

| Method | Endpoint               | Description                         |
| ------ | ---------------------- | ----------------------------------- |
| GET    | `/api/jobs`            | List all jobs                       |
| GET    | `/api/jobs/:id`        | Fetch single job (by \_id or JobId) |
| POST   | `/api/jobs`            | Create new job                      |
| PUT    | `/api/jobs/:id`        | Update existing job                 |
| DELETE | `/api/jobs/:id`        | Delete job (soft‑delete optional)   |
| POST   | `/api/jobs/:id/upload` | Upload document                     |

### Couriers

| Method | Endpoint        | Description   |
| ------ | --------------- | ------------- |
| GET    | `/api/couriers` | List couriers |
| POST   | `/api/couriers` | Add courier   |

> **Note:** All endpoints return JSON (`application/json`). For secure routes include `Authorization: Bearer <token>`.

## Frontend Usage

* **Admin Portal** (Desktop width ≥ 1024): manage jobs, status changes, file uploads, and dashboard analytics.
* **Courier App** (Mobile 375×639): update live status, open navigation maps, chat with admin, upload POD documents.

Navigation, tabs and pop‑ups follow Figma design tokens; components are kept in `public/` for easy static hosting (e.g. Netlify, GitHub Pages).

## Testing

```bash
# run Jest unit & integration tests
$ npm test
```

Supertest covers REST endpoints and mocks MongoDB (via `mongodb‑memory‑server`).

## Deployment

TrackMe can be deployed to any platform that supports Node and MongoDB:

1. **Docker** – see `docker-compose.yml` to spin up `server` + `mongo` + `nginx`.
2. **Render / Railway** – one‑click deploy; set env vars in dashboard.
3. **Vercel / Netlify** – serve `/public` separately; backend via serverless or separate service.

## Contributing

Pull requests are welcome! Please open an issue first to discuss major changes.

1. `git checkout -b feature/awesome`
2. Commit your changes (`git commit -m "feat: add awesome"`)
3. `git push origin feature/awesome`
4. Open a PR

Style guide: ESLint + Prettier. Commit messages follow Conventional Commits.

## License

Released under the **MIT License** – see [`LICENSE`](LICENSE) for details.

## Acknowledgements

* Google Maps Platform – geocoding & autocomplete service.
* [intl‑tel‑input](https://github.com/jackocnr/intl-tel-input) – international telephone input UX.
* Figma – design source of truth.

---

> Made with ☕ & 🚀 by Yehonatan Shapira & contributors.

## Project Links

* **Source Code**: [GitHub Repository](https://github.com/jonatan610/html-shenkar-2025-YS/tree/main/TrackMe)
* **Admin Demo**: [Admin Login](https://html-shenkar-2025-ys.onrender.com/admin-login.html)
* **Courier Demo**: [Courier Login](https://html-shenkar-2025-ys.onrender.com/courier-login.html)
* **Figma Design—Node View**: [TrackMe in Figma (node 58‑2)](https://www.figma.com/design/EkyTqZagSDw7TF8ByeoWfQ/TrackMe?node-id=58-2&t=WHgE010fYIABr9u2-1)
* **Figma Design—Overview**: [TrackMe in Figma (auto view)](https://www.figma.com/design/EkyTqZagSDw7TF8ByeoWfQ/TrackMe?m=auto&t=WHgE010fYIABr9u2-1)

## Demo Credentials

| Role       | Email                                                 | Password    |
| ---------- | ----------------------------------------------------- | ----------- |
| Admin      | [admin@trackme.com](mailto:admin@trackme.com)         | Admin\@2024 |
| Courier 1  | [courier1@trackme.com](mailto:courier1@trackme.com)   | Pass123!    |
| Courier 2  | [courier2@trackme.com](mailto:courier2@trackme.com)   | Pass234!    |
| Courier 3  | [courier3@trackme.com](mailto:courier3@trackme.com)   | Pass345!    |
| Courier 4  | [courier4@trackme.com](mailto:courier4@trackme.com)   | Pass456!    |
| Courier 5  | [courier5@trackme.com](mailto:courier5@trackme.com)   | Pass567!    |
| Courier 6  | [courier6@trackme.com](mailto:courier6@trackme.com)   | Pass678!    |
| Courier 7  | [courier7@trackme.com](mailto:courier7@trackme.com)   | Pass789!    |
| Courier 8  | [courier8@trackme.com](mailto:courier8@trackme.com)   | Pass890!    |
| Courier 9  | [courier9@trackme.com](mailto:courier9@trackme.com)   | Pass901!    |
| Courier 10 | [courier10@trackme.com](mailto:courier10@trackme.com) | Pass012!    |
