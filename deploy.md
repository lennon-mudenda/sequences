# Deploying to GitHub Pages

This project is a static site, so GitHub Pages can host it directly with no build step.

Current repository structure:

```text
.
├── index.html
├── README.md
├── deploy.md
└── assets
    ├── app.js
    ├── simulations.json
    └── styles.css
```

## 1. Create or choose a GitHub repository

You have two common options:

### Option A: Project site

Use any repository name, for example:

```text
swift-loop-visualiser
```

Your site URL will be:

```text
https://<your-username>.github.io/swift-loop-visualiser/
```

### Option B: User site

Name the repository exactly:

```text
<your-username>.github.io
```

Your site URL will be:

```text
https://<your-username>.github.io/
```

For this project, Option A is usually the better choice unless this is meant to be your main personal site.

## 2. Push the project to GitHub

If this folder is not already a git repository:

```bash
git init
git add .
git commit -m "Initial GitHub Pages version"
```

Add your GitHub repository as the remote:

```bash
git remote add origin https://github.com/<your-username>/<repo-name>.git
```

Push the code:

```bash
git branch -M main
git push -u origin main
```

If the repository already exists locally, just commit your latest changes and push:

```bash
git add .
git commit -m "Prepare site for GitHub Pages"
git push
```

## 3. Enable GitHub Pages

On GitHub:

1. Open the repository.
2. Click `Settings`.
3. In the left sidebar, click `Pages`.
4. Under `Build and deployment`, set:
   - `Source`: `Deploy from a branch`
   - `Branch`: `main`
   - `Folder`: `/ (root)`
5. Click `Save`.

GitHub will start publishing the site.

## 4. Wait for the first deployment

After saving the Pages settings:

1. GitHub will show a deployment status.
2. Wait a minute or two.
3. Refresh the `Pages` settings screen.
4. GitHub should show the live site URL.

You can also check the `Actions` tab if the deployment takes longer than expected.

## 5. Verify the live site

Open the published URL and confirm:

1. The homepage loads.
2. The lesson dropdown is populated.
3. Clicking `Next Step` updates the code, variables, and visual state.
4. The practice section loads for each lesson.
5. No JSON loading error appears.

## 6. Make updates later

Any future change follows the same flow:

```bash
git add .
git commit -m "Describe your change"
git push
```

GitHub Pages will automatically redeploy from the `main` branch.

## 7. Where to edit things

### Change lesson content

Edit:

```text
assets/simulations.json
```

Use this for:

- simulation definitions
- practice questions
- answers
- precomputed step sequences

### Change the UI or behavior

Edit:

```text
assets/styles.css
assets/app.js
index.html
```

Use:

- `assets/styles.css` for styling
- `assets/app.js` for interaction and rendering logic
- `index.html` for page structure

## 8. Important path rule for GitHub Pages

Keep asset paths relative.

These are correct:

```html
<link rel="stylesheet" href="assets/styles.css">
<script src="assets/app.js" defer></script>
```

And in JavaScript:

```js
fetch("assets/simulations.json")
```

Do not switch these to leading-slash paths like:

```text
/assets/styles.css
/assets/app.js
/assets/simulations.json
```

Leading slashes often break on GitHub Pages project sites because the site is usually served from:

```text
/<repo-name>/
```

## 9. If the site shows a JSON loading error

Check these things:

1. `assets/simulations.json` exists in the repository.
2. The file name matches exactly, including case.
3. The JSON is valid.
4. GitHub Pages is publishing from the correct branch and root folder.
5. The browser console does not show a 404 for `assets/simulations.json`.

## 10. Suggested first deployment checklist

Before publishing:

1. Run the site locally through a server.
2. Confirm the page loads from `http://localhost:8080/`.
3. Confirm lessons load from `assets/simulations.json`.
4. Confirm the buttons and practice timer work.
5. Commit and push only after the local version works.
