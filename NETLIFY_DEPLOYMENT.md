# Netlify Deployment Guide for Next.js Project

## Current Configuration ✅
- `_redirects` file is already in `/public/` folder with `/* /index.html 200`
- `next.config.mjs` configured for static export with `output: 'export'`
- Project structure follows Next.js conventions

## Deployment Steps

### Option 1: Connect Git Repository (Recommended)
1. Push your code to GitHub/GitLab/Bitbucket
2. Connect your repository to Netlify
3. Build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `out`
   - **Node version**: 18 or higher

### Option 2: Manual Upload
1. Run `npm run build` locally
2. Upload the generated `out` folder to Netlify
3. The `_redirects` file will be automatically included

## Build Process
Next.js will automatically:
- Generate optimized HTML, CSS, and JS files
- Create the proper file structure in the `out` directory
- Include the `_redirects` file for SPA routing
- Optimize images and assets

## Important Notes
- **DO NOT** manually move `index.html` or CSS/JS files
- **DO NOT** modify the Next.js project structure
- The current configuration is already optimized for Netlify
- All routing will be handled client-side after deployment

## Troubleshooting
If you still get 404 errors:
1. Verify the `_redirects` file exists in `/public/`
2. Check that build command is `npm run build`
3. Ensure publish directory is set to `out`
4. Clear Netlify cache and redeploy
