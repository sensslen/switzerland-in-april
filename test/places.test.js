import test from 'node:test';
import assert from 'node:assert/strict';
import places from '../src/places.json' with { type: 'json' };
import { placesInBounds, spreadPins } from '../src/geo.js';
import { kidsLabels, kidsPlaces, regions } from '../src/trip.js';

test('geographic place numbers survive filtering and returning to all places', () => {
  assert.deepEqual(places.map(place => place.number), Array.from({ length: 25 }, (_, i) => i + 1));
  const visible = placesInBounds(places, { south: 46.56, north: 46.76, west: 7.65, east: 8.23 });
  assert.deepEqual(visible.map(place => place.number), [16, 17, 18, 19, 20, 21, 22, 23, 24, 25]);
  assert.equal(visible[0].title, 'Spiez bay on Lake Thun');
  assert.equal(placesInBounds(places, null)[4].number, 5);
  assert.deepEqual(placesInBounds(places, { south: 48, north: 49, west: 10, east: 11 }), []);
});

test('kids feasibility orders every place without hiding difficult or age-restricted visits', () => {
  assert.deepEqual(kidsPlaces.map(place => place.number).sort((a, b) => a - b), places.map(place => place.number));
  for (const [index, place] of kidsPlaces.entries()) {
    assert.ok(Number.isInteger(place.kidsFeasibility) && kidsLabels[place.kidsFeasibility], place.title);
    assert.ok(place.familyNote && place.aprilNote, place.title);
    if (index > 0) {
      const previous = kidsPlaces[index - 1];
      assert.ok(previous.kidsFeasibility > place.kidsFeasibility ||
        (previous.kidsFeasibility === place.kidsFeasibility && previous.number < place.number));
    }
  }
  assert.equal(kidsPlaces.at(-1).number, 25);
});

test('each place belongs to exactly one regional shortcut, including the new additions', () => {
  const regionalNumbers = regions.slice(1).flatMap(region => region.ids).sort((a, b) => a - b);
  assert.deepEqual(regionalNumbers, places.map(place => place.number));
  assert.ok(regions.find(region => region.title === 'Lucerne & Rigi').ids.includes(14));
  assert.ok(regions.find(region => region.title === 'Interlaken & Lake Thun').ids.includes(15));
  assert.ok(regions.find(region => region.title === 'Frauenfeld & the Rhine').ids.includes(10));
});

test('every place has a remote photograph, source and image licence', () => {
  for (const place of places) {
    const photo = new URL(place.photo);
    assert.equal(photo.protocol, 'https:', place.title);
    assert.ok(['upload.wikimedia.org', 'thumb.wikimedia.org'].includes(photo.hostname), place.title);
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
