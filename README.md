# Naanghirisa Organisation Portal

Production-ready build notes:

- Assets are included in the `assets/` directory.
- Firebase auth uses live authentication only.
- Local storage auth fallback has been removed.
- App rendering is wrapped in an error boundary for better failure handling.


## Vercel deploy
Use the root `vercel.json`, `npm install`, and `npm run build`. Tailwind scans only the app source folders.
