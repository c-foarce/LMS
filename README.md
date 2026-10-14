# Learning Management System (LMS)

A full-stack Learning Management System built with **React** and **Django REST Framework**. The application provides role-based functionality for students, teachers, and administrators, including course management, enrolments, progress tracking, grading, and user administration.

## Live Application

- **Frontend:** [https://c-foarce.github.io/LMS/](https://c-foarce.github.io/LMS/)
- **Backend API:** [https://lms-backend-jref.onrender.com](https://lms-backend-jref.onrender.com)
- **GitHub Repository:** [https://github.com/c-foarce/LMS](https://github.com/c-foarce/LMS)

The frontend is hosted on GitHub Pages, with the REST API hosted separately on Render. The backend uses a free hosting tier and may take a short time to respond after inactivity.

**Demo access:** Credentials are not published in this repository. Administrator access for assessment can be provided privately to the intended reviewer.

## Features

### Student

- Register and log in securely.
- Browse courses and view course details.
- Enrol in courses and manage current enrolments.
- Track submission progress and course completion.
- View grades and completed-course history.
- Acknowledge course completion where applicable.

### Teacher

- View assigned courses and manage course content.
- Create courses with ownership enforced by the backend.
- Review enrolled students and their progress.
- Grade enrolments and monitor course completion.

### Administrator

- View, create, edit, and delete users.
- Manage user roles and course assignments.
- Create and manage courses.
- View and manage enrolments.
- Activate and deactivate courses.

The backend enforces role-based permissions independently of the frontend, protecting restricted operations from unauthorised API requests.

## Project Wireframes

Here is a preview of the initial application layout and design architecture:
![Project Wireframe Page 1](screenshots/Project%20Wireframe%20Page%201.png)

You can view the full set of 15 system layouts and user flows directly inside the [Wireframes Folder](./screenshots).

## Technology Stack

**Frontend**
- React 19 and Vite
- React Router
- Axios
- CSS Modules and shared CSS variables
- Vitest, Playwright, and ESLint

**Backend**
- Python and Django 6
- Django REST Framework
- Simple JWT authentication
- SQLite for local development
- `dj-database-url` for database configuration
- Gunicorn and WhiteNoise for deployment

## Installation and Local Development

### Prerequisites

- Git
- Python compatible with the installed Django version
- Node.js 22 or later and npm

### 1. Clone the Repository

```bash
git clone https://github.com/c-foarce/LMS.git
cd LMS
```

### 2. Set Up the Backend

Create and activate a virtual environment from the repository root.

**Windows PowerShell**

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
```

**macOS/Linux**

```bash
python3 -m venv .venv
source .venv/bin/activate
```

Install dependencies and initialise the database:

```bash
cd backend
python -m pip install --upgrade pip
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

The API will be available at `http://127.0.0.1:8000/api/`. SQLite is used by default for local development.

To create a Django superuser for the Django administration site, run the following in a separate terminal with the virtual environment activated:

```bash
python manage.py createsuperuser
```

This is separate from an LMS account with the administrator role.

### 3. Set Up the Frontend

Open a second terminal from the repository root:

```bash
cd frontend
npm ci
npm run dev
```

Vite will display the local frontend URL, normally `http://localhost:5173/`.

The frontend API URL defaults to `http://127.0.0.1:8000/api`. To override it, create `frontend/.env.local`:

```dotenv
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

Restart the development server after changing environment variables. Never store secrets in frontend environment variables, as `VITE_` variables are exposed in the client bundle.

## Configuration and Security

The backend supports the following environment variables:

| Variable | Purpose |
|---|---|
| `DJANGO_SECRET_KEY` | Django signing key; use a strong, private value in production. |
| `DJANGO_DEBUG` | Enables or disables debug mode. Disable in production. |
| `DJANGO_ALLOWED_HOSTS` | Comma-separated list of permitted hostnames. |
| `FRONTEND_URL` | Frontend origin permitted by CORS. |
| `DATABASE_URL` | Optional database connection URL; SQLite is used when unset. |

Configure production values through the hosting provider rather than committing secrets to source control. Production database persistence depends on the configured database service and hosting plan.

Authentication uses JWT access and refresh tokens. The frontend sends access tokens with API requests, and the API client handles token refresh when required. Backend permission classes restrict operations according to user role.

Public registration permits student and teacher accounts only; administrator-level account management is restricted.

## Testing and Quality Checks

### Backend Tests

From the repository root:

```bash
cd backend
python manage.py test
```

### Frontend Tests

From the repository root:

```bash
cd frontend
npm ci
npx playwright install chromium
npm run test -- --run
```

The frontend uses Vitest in browser mode with Chromium.

### Linting and Production Build

From `frontend/`:

```bash
npm run lint
npm run build
```

The production build is generated in `frontend/dist/`.

## Deployment

- **Frontend:** GitHub Pages, deployed through the GitHub Actions workflow in `.github/workflows/deploy.yml`.
- **Backend:** Render, serving the Django REST API.

The deployment workflow builds the frontend with the production API URL and publishes it to GitHub Pages. The Vite base path is configured for the repository's `/LMS/` URL.

The production backend requires appropriate secret-key, debug, allowed-host, CORS, and database configuration.
