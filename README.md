# Switzerland in April

[Open the live map on GitHub Pages](https://sensslen.github.io/switzerland-in-april/).

An interactive map and illustrated list of 25 places in Switzerland for 1 to 9 April 2027. Panning or zooming filters the list to places inside the map bounds. Place numbers follow geographic groups and stay fixed when the list is sorted or the map is filtered. Close labels are spaced apart, with lines pointing to their locations. Numbers 1 to 10 cover northeastern Switzerland, 11 to 14 Lucerne and Rigi, and 15 to 25 the Interlaken and Lake Thun region. Nearby towns, lakeside stops and valley sights have neighbouring numbers. Ballenberg opens on 15 April 2027, after the visit.

The list follows geographic place numbers. Kids feasibility is information only and does not affect sorting. Ratings describe effort and access for a family whose youngest child is three: 5 very easy, 4 easy, 3 some planning, 2 demanding, 1 age restriction. Every mapped place remains available at every rating. Opening dates, seasonal uncertainty and family-access notes are shown separately.

The map starts at about half the viewport height, shrinks while scrolling down the list, and expands before an upward wheel or touch gesture continues through the list. On desktop, scrolling over the map expands it to full size and zooms in or out without scrolling the page. The map-size button also allows explicit control; keyboard and scrollbar navigation remain available. Leaflet resizes with its container.

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

For the desktop and touch scrolling checks, install Chromium once, then run:

```sh
npx playwright install chromium
npm run test:browser
```

The browser check starts a local Vite server automatically.

## Publish

The Pages workflow checks and builds pull requests. Pushes to `main` also deploy `dist/` to GitHub Pages. The repository's Pages publishing source must be **GitHub Actions**. No repository secrets are needed.

## Content and photographs

Suggestions, coordinates, image credits and source links are in `src/places.json`. Coordinates indicate approximate locations. April information was checked on 9 November 2026 for a visit on 1 to 9 April 2027.

Photographs load directly from Wikimedia Commons using remote thumbnail URLs; no photograph files are included in the build. Each entry links to its original image and licence. Photographs use subject-focused crops where appropriate. Wide panoramas and portrait waterfall images retain the full composition over a blurred background fill. Lucerne uses a replacement photograph with a more suitable aspect ratio. Map data is © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright).
