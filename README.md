# StoreRate Frontend

StoreRate is a responsive React single-page application for managing stores, users, and customer ratings. It connects to the Store Rating backend API and provides separate workspaces for administrators, normal users, and store owners.
## Features

- User registration and login
- JWT-based session persistence
## Technology stack

### Runtime and build tools
| Technology | Purpose |
| --- | --- |
| React `19.2.8` | Component-based UI and application state |
### UI and styling

| Technology | Purpose |
### Routing, forms, and data

| Technology | Purpose |
### Code quality and compilation

| Technology | Purpose |
## Requirements

- Node.js 18 or newer
- npm
## Installation

From this directory (`frontend/`), install dependencies:
```bash
npm install
```
The frontend does not currently include a committed `.env.example`. Create a `.env` file when the API is not running at the default local URL:

```env
VITE_API_URL=http://localhost:5000
```

`VITE_API_URL` is optional. When omitted, Axios uses `http://localhost:5000/api` as its base URL. Never put secrets in frontend environment variables: Vite exposes variables prefixed with `VITE_` to browser code.
## Running locally

Start the Vite development server:
```bash
npm run dev
```
Vite prints the local URL, normally `http://localhost:5173`.

PowerShell with a custom API URL:
$env:VITE_API_URL="http://localhost:5000"; npm run dev
```

macOS/Linux with a custom API URL:
```bash
VITE_API_URL=http://localhost:5000 npm run dev
```
The backend must be configured and running separately. See the backend README for PostgreSQL setup and API details.

## Production build
Create an optimized production bundle:

```bash
npm run build
```
The generated files are written to `dist/`. Preview the production bundle locally:

```bash
npm run preview
```
Run linting with:

```bash
npm run lint
```
| Command | Description |
| --- | --- |
| `npm run dev` | Start Vite development server with HMR |
| `npm run build` | Build the production bundle in `dist/` |
| `npm run preview` | Serve the production bundle locally |
| `npm run lint` | Run ESLint across the frontend |

## Application routes

| Route | Access | Purpose |
| --- | --- | --- |
| `/` | Public | Redirects to `/login` |
| `/login` | Public | Authenticate an existing account |
| `/register` | Public | Create a normal `USER` account |
| `/unauthorized` | Public | Displayed when a user opens a restricted route |
| `/admin` | `ADMIN` | Administration dashboard |
| `/user` | `USER` | Store browsing and rating dashboard |
| `/store-owner` | `STORE_OWNER` | Owned-store rating insights |

Unauthenticated users are redirected to `/login`. Authenticated users with the wrong role are redirected to `/unauthorized`.

## User workflows

### Registration and login

1. Open `/register` and submit a name, email, password, and address.
2. The frontend validates the form with Yup before calling `POST /api/auth/register`.
3. Successful registration redirects to `/login`.
4. Login calls `POST /api/auth/login`, stores the returned token and user details, and redirects by role.

Registration validation requires:

- Name between 20 and 60 characters
- Valid email address
- Password between 8 and 16 characters
- At least one uppercase letter and one special character
- Address with a maximum of 400 characters

### Normal user

The `/user` dashboard loads stores from `GET /api/user/stores`. Users can search by store name or address and submit a 1-5 star rating. Existing ratings are updated rather than duplicated. Users can also change their password from the dashboard.

### Administrator

The `/admin` dashboard loads statistics, users, and stores. Administrators can:

- See total users, stores, and submitted ratings
- Search and sort users and stores
- Filter users by role
- Create users with any supported role
- Create stores and optionally assign a store owner
- Change an existing user role

### Store owner

The `/store-owner` dashboard loads owned-store rating data from `GET /api/store/dashboard` and the aggregate from `GET /api/store/average-rating`. Store owners can search and sort customer ratings and change their password.

## Backend API integration

The Axios client is defined in `src/services/api.js`:

```js
baseURL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`
```

Every request reads `store-rating-user` from `localStorage` and, when a token is present, adds:

```http
Authorization: Bearer <jwt>
```

The frontend calls these backend endpoints:

| Feature | HTTP request |
| --- | --- |
| Register | `POST /api/auth/register` |
| Login | `POST /api/auth/login` |
| Admin dashboard | `GET /api/admin/dashboard` |
| Admin users | `GET /api/admin/users` |
| Create user | `POST /api/admin/users` |
| Change role | `PATCH /api/admin/users/:id/role` |
| Admin stores | `GET /api/admin/stores` |
| Create store | `POST /api/admin/stores` |
| Browse stores | `GET /api/user/stores` |
| Submit rating | `POST /api/user/ratings` |
| Update rating | `PUT /api/user/ratings/:id` |
| Change password | `PUT /api/user/password` |
| Store-owner ratings | `GET /api/store/dashboard` |
| Store-owner average | `GET /api/store/average-rating` |

## Authentication behavior

Authentication is managed by `src/context/AuthContext.jsx`:

- Login normalizes the API response and stores token, user id, name, email, and uppercase role.
- The session is persisted under the `store-rating-user` local-storage key.
- On application startup, the stored JWT is decoded and checked for expiry.
- Invalid or expired stored sessions are removed automatically.
- Logout clears the in-memory user and local-storage session.

This is client-side route protection only. The backend remains responsible for verifying the JWT and enforcing roles on every protected API request.

## Project structure

```text
index.html                 HTML entry point
vite.config.js             Vite, React, and React Compiler configuration
tailwind.config.js         Tailwind content configuration
postcss.config.js          PostCSS configuration
eslint.config.js           ESLint flat configuration
public/                    Static public assets
src/main.jsx               React root, StrictMode, and BrowserRouter
src/App.jsx                Routes, protected routes, and shared layout
src/index.css              Tailwind directives and global styles
src/App.css                Legacy/template styles retained by the project
src/components/            Navbar, footer, tables, loading, and star rating UI
src/context/AuthContext.jsx Shared authentication state and persistence
src/pages/                 Login, registration, and role dashboards
src/services/api.js        Axios instance and JWT request interceptor
src/utils/validations.js   Yup schemas for login and registration
```

## Deployment

Build the project with `npm run build` and deploy the contents of `dist/` to a static hosting provider such as Vercel, Netlify, or an equivalent web server.

Set the production API URL as a build-time environment variable:

```env
VITE_API_URL=https://your-backend.example.com
```

The backend must allow requests from the deployed frontend and must be reachable over HTTPS in production. Configure the host to serve `index.html` as a fallback for client-side routes such as `/admin`, `/user`, and `/store-owner`; otherwise refreshing those routes can return a 404.

## Troubleshooting

### API requests fail with a network error

Confirm the backend is running, check `VITE_API_URL`, and restart Vite after changing `.env` because environment variables are read during the build/dev-server startup.

### The app redirects to login unexpectedly

The JWT may be expired, malformed, or missing from the `store-rating-user` local-storage entry. Log in again and inspect the browser's local storage if the issue persists.

### A dashboard shows unauthorized

Verify that the logged-in account has the role required by the route and that the backend JWT contains the matching role claim.

### Refreshing a dashboard returns 404 in production

Configure SPA history fallback on the hosting provider so unknown paths serve the frontend `index.html`.
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
