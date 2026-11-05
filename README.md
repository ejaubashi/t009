# endy.j

An animated creative studio website inspired by the supplied desktop recordings. Built with Vite, vanilla JavaScript, and Three.js. All artwork is generated locally with WebGL and CSS; no remote media is required.

## Develop

Requires Node.js 20.19+ or 22.12+.

```sh
npm ci
npm run dev
```

## Production

```sh
npm run build
npm run preview
```

The site includes a loader, interactive 3D hero, responsive gallery, project dialogs, navigation overlay, optional synthesized ambient audio, reduced-motion support, and contact links.

## Before publishing

`hello@endy.j` and social profile links are placeholders. Replace them with the actual contact address and social URLs. The portfolio entries are demonstration concepts, not claims of completed client work. The original site's proprietary media is not included, so this is a recreation of its visual direction rather than a pixel-identical copy.

## GitHub Pages

The prebuilt site is committed in `docs/`, with relative asset paths for GitHub Pages.
In the repository **Settings → Pages**, select **Deploy from a branch**, choose **main**, select **/docs**, and save.
The expected site URL is `https://ejaubashi.github.io/t009/` after GitHub finishes deployment.
For changes, run `npm run build:pages` and commit the updated `docs/` alongside the source.
