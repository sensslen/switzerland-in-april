export function placesInBounds(places, bounds) {
  if (!bounds) return places;
  return places.filter(({ lat, lng }) =>
    lat >= bounds.south && lat <= bounds.north &&
    lng >= bounds.west && lng <= bounds.east);
}

export function spreadPins(points, width, height) {
  const pins = points.map(point => ({ ...point, px: point.x, py: point.y }));
  // ponytail: Pairwise spacing is small enough for these 23 places.
  for (let pass = 0; pass < 32; pass++) {
    for (let i = 0; i < pins.length; i++) {
      for (const b of pins.slice(i + 1)) {
        const a = pins[i];
        const dx = b.px - a.px;
        const dy = b.py - a.py;
        const distance = Math.hypot(dx, dy);
        if (distance < 39) {
          const shift = (39 - distance) / 2;
          const ux = distance ? dx / distance : 1;
          const uy = distance ? dy / distance : 0;
          a.px -= ux * shift;
          a.py -= uy * shift;
          b.px += ux * shift;
          b.py += uy * shift;
        }
      }
    }
    for (const pin of pins) {
      pin.px = Math.max(21, Math.min(width - 21, pin.px));
      pin.py = Math.max(21, Math.min(height - 21, pin.py));
    }
  }
  return pins;
}
