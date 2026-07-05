# Recruiter-Ready Portfolio Release

## Branch Integration

The release branch is `release/recruiter-ready-portfolio`.

Inspected branches:

- `main`
- `origin/production`
- `feature/blender-career-world`
- `feature/polish-blender-career-world`
- `feature/blender-art-polish-pass-2`
- `feature/update-career-world-models-and-environment`
- `feature/portfolio-content-crud`
- `origin/feature/experience-brand-logos`

Integration choices:

- The release is based on `feature/portfolio-content-crud` because it already contains the latest career-world stack, the current HSClient/HSApi/HSCms architecture and the preserved recruiter-release inputs.
- The GitHub Pages deployment commits from `origin/production` were cherry-picked because they are unique and completed.
- The Blender career-world branches were not merged directly because they are ancestors of the chosen base branch.
- `origin/feature/experience-brand-logos` was not merged because it targets the older root client layout and uses root-relative public assets.

## Public Content

The public fallback content is the recruiter-facing source used by GitHub Pages when no hosted API is configured. It includes:

- verified .NET, automation, IoT, test and leadership experience
- verified EC Utbildning and Hyper Island education
- selected real portfolio projects
- a dedicated Local AI Lab section
- same-origin CV download links

Unfinished public demos are hidden from the normal site. The Say Hi source remains in the codebase, but the public navigation and page no longer render it for the static GitHub Pages release.

## Local AI Model

Source:

```text
Assets/Blender/Sources/ai-core.blend
```

Export command:

```bash
export BLENDER_EXECUTABLE="/Applications/Blender.app/Contents/MacOS/Blender"
npm run models:export-ai-core
```

Runtime assets:

```text
HSClient/public/models/ai-core/ai-core.glb
HSClient/public/images/ai-core/ai-core-poster.png
```

Generated review artifacts:

```text
Assets/Blender/Previews/ai-core-desktop.png
Assets/Blender/Previews/ai-core-mobile.png
Assets/Blender/Reports/ai-core.json
```

The runtime uses plain Three.js and `GLTFLoader`. The GLB is exported without Draco or Meshopt compression because the current runtime does not register those loaders.

## GitHub Pages

The Pages workflow builds `HSClient` from `main` and deploys `HSClient/dist`.

Static build environment:

```text
VITE_BASE_PATH=/hugospangberg-portfolio/
VITE_API_ENABLED=false
VITE_ADMIN_ENABLED=false
VITE_SAY_HI_ENABLED=false
```

Public files must be resolved through `import.meta.env.BASE_URL` or Vite HTML `%BASE_URL%` placeholders. Do not use root-relative paths for models, images, the CV PDF, favicons or posters.

## Verification

Before merging to `main`, run:

```bash
npm ci
npm run lint
npm run typecheck
npm run test:client
npm run models:validate
npm run build:client
dotnet restore
dotnet build HugoSpangberg.Portfolio.sln --configuration Release
dotnet test HugoSpangberg.Portfolio.sln --configuration Release
```

For Pages-base validation, run the Playwright release spec against a production build with:

```bash
VITE_BASE_PATH=/hugospangberg-portfolio/ \
VITE_API_ENABLED=false \
VITE_ADMIN_ENABLED=false \
VITE_SAY_HI_ENABLED=false \
PLAYWRIGHT_BASE_URL=http://127.0.0.1:4173/hugospangberg-portfolio/ \
npm --workspace HSClient run e2e -- e2e/recruiter-release.spec.ts
```
