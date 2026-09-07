# Swift Loop & Sequence Visualiser

A small static learning site for tracing Swift loops and sequence logic step by step.

The site is structured for GitHub Pages and does not require a build step.

## Repository Layout

```text
.
├── index.html
├── README.md
└── assets
    ├── app.js
    ├── simulations.json
    └── styles.css
```

## Local Preview

Serve the repository root with any static server so `fetch()` can load the JSON file.

Examples:

```bash
php -S localhost:8080
```

Then open:

```text
http://localhost:8080/
```

## GitHub Pages Deployment

This repo is ready for GitHub Pages as a static site.

1. Push the repository to GitHub.
2. Open `Settings > Pages`.
3. Set `Source` to `Deploy from a branch`.
4. Select your branch, usually `main`.
5. Select the folder `/ (root)`.
6. Save.

For a normal project repository, the site URL will look like:

```text
https://<username>.github.io/<repo-name>/
```

## Contributing

### Content changes

Most lesson updates should happen in [assets/simulations.json](/Users/leemuddy/Projects/mcri/sequences/assets/simulations.json).

Each simulation entry contains:

- `id`: stable internal identifier
- `label`: dropdown label
- `code`: Swift code lines shown in the lesson
- `sequence`: sequence items for linear visualisations
- `grid`: set to `true` for grid-based lessons
- `practice`: practice question content
- `steps`: the precomputed simulation timeline used by the UI

When adding a new lesson:

1. Add a new object to `simulations`.
2. Include all required fields.
3. Make sure `steps` matches the current UI contract in `assets/app.js`.
4. Preview locally and step through the lesson manually.

### UI changes

- Update layout and visual styles in [assets/styles.css](/Users/leemuddy/Projects/mcri/sequences/assets/styles.css).
- Update rendering and interaction logic in [assets/app.js](/Users/leemuddy/Projects/mcri/sequences/assets/app.js).
- Keep paths relative so the site works on GitHub Pages project URLs.

### Review checklist

Before opening a PR:

1. Run the site locally through a server.
2. Verify the lesson dropdown loads.
3. Verify `Next Step`, `Previous`, `Auto Play`, and `Reset`.
4. Verify the practice timer and answer reveal flow.
5. Verify any new simulation displays the correct code, variables, output, and visual state.

## Notes

- There is no bundler, framework, or build pipeline.
- `index.html` is the entry point and should remain at the repository root for simple GitHub Pages hosting.
- Asset paths should stay relative, for example `assets/styles.css`, not absolute root paths like `/assets/styles.css`.
