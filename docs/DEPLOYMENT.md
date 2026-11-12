# Deployment Guide — Hardware Diagnostic Suite

This project is pre-configured for zero-configuration deployment across **GitHub Pages**, **Vercel**, **Netlify**, and **Cloudflare Pages**.

---

## 1. GitHub Pages (Automated via GitHub Actions)

1. Push changes to the `main` branch on GitHub.
2. Open your repository on GitHub and navigate to **Settings -> Pages**.
3. Under **Build and deployment -> Source**, select **GitHub Actions**.
4. The workflow in `.github/workflows/deploy.yml` will automatically build the TypeScript + Vite bundle (`dist/`) and publish it to `https://<username>.github.io/<repo>/`.

---

## 2. Vercel

1. Import the GitHub repository into [Vercel](https://vercel.com/).
2. Vercel automatically detects `vercel.json` with:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Click **Deploy**.

---

## 3. Netlify

1. Import the repository into [Netlify](https://www.netlify.com/) or drag-and-drop the `dist/` folder into **Netlify Drop**.
2. `netlify.toml` and `public/_redirects` automatically configure the build command, publish directory, and SPA routing.

---

## 4. Local Production Preview

To build and test the exact production bundle locally:

```bash
npm run build
npm run preview
```
