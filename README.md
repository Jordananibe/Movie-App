# FRAME

FRAME is a React movie discovery app powered by the TMDB API.

## Requirements

- Node.js and npm
- A TMDB API key

## Local development

1. Install dependencies:

   ```sh
   npm install
   ```

2. Create `.env.local` in the project root and set:

   ```env
   VITE_TMDB_API_KEY=your_tmdb_api_key
   ```

3. Start the development server:

   ```sh
   npm run dev
   ```

Vite exposes `VITE_` variables in the browser bundle. Treat the TMDB key as
public; do not put private credentials in a `VITE_` variable.

## Build and deploy

Run `npm run build` to create the production site in `dist/`. Set
`VITE_TMDB_API_KEY` in the deployment provider's environment settings.

The included Vercel configuration rewrites client-side routes to the app entry
point so direct visits to routes such as `/discover` work on static hosting.
