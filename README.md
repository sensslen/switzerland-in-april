# Switzerland in April

An interactive map and illustrated list of 22 places in Switzerland for 1 to 9 April 2027. Panning or zooming filters the list to places inside the map bounds. Place numbers match the original document and remain fixed. Close labels are spaced apart, with lines pointing to their locations. The original place 23, Ballenberg, is excluded because it opens after the visit.

Built with React, React Leaflet, Leaflet and Vite. The app is entirely static. It uses OpenStreetMap tiles without an API key.

## Develop

Use Node.js 24 or newer.

```sh
npm ci
npm run dev
```

```sh
npm test
npm run build
npm run preview
```

## Publish

The Pages workflow checks and builds pull requests. Pushes to `main` also deploy `dist/` to GitHub Pages. The repository's Pages publishing source must be **GitHub Actions**. No repository secrets are needed.

## Content and photographs

Suggestions, coordinates, image credits and source links are in `src/places.json`. Coordinates indicate approximate locations. April information was checked on 6 November 2026 for a visit on 1 to 9 April 2027.

Photographs retain their individual licences. Each entry links to the original image and licence. Local copies are resized and converted to WebP. Map data is © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright).
