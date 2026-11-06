import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import places from '../src/places.json' with { type: 'json' };
import { placesInBounds, spreadPins } from '../src/geo.js';

test('the document numbers survive filtering and returning to all places', () => {
  assert.deepEqual(places.map(place => place.number), Array.from({ length: 22 }, (_, i) => i + 1));
  const visible = placesInBounds(places, { south: 46.56, north: 46.76, west: 7.65, east: 8.23 });
  assert.deepEqual(visible.map(place => place.number), [13, 14, 15, 16, 17, 18, 19, 20, 21, 22]);
  assert.equal(visible[0].title, 'Unterseen and the Aare riverside');
  assert.equal(placesInBounds(places, null)[4].number, 5);
  assert.deepEqual(placesInBounds(places, { south: 48, north: 49, west: 10, east: 11 }), []);
});

test('every place has its photograph, source and image licence', () => {
  for (const place of places) {
    assert.ok(existsSync(new URL(`../public/${place.photo}`, import.meta.url)), place.title);
    assert.ok(place.credit.author && place.credit.license && place.credit.source.startsWith('https://'));
    assert.ok(place.links.every(([, url]) => url.startsWith('https://')));
    assert.ok(!/snack|playground|supervise/i.test(place.body));
  }
});

test('close map dots spread apart without changing their numbers or actual locations', () => {
  const points = [{ number: 18, x: 100, y: 100 }, { number: 19, x: 100, y: 100 }];
  const pins = spreadPins(points, 400, 300);
  assert.deepEqual(pins.map(pin => pin.number), [18, 19]);
  assert.ok(Math.hypot(pins[0].px - pins[1].px, pins[0].py - pins[1].py) >= 38);
  assert.deepEqual(points, [{ number: 18, x: 100, y: 100 }, { number: 19, x: 100, y: 100 }]);
});
