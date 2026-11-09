import places from './places.json' with { type: 'json' };

export { places };
export const kidsLabels = { 1: 'Age restriction', 2: 'Demanding', 3: 'Some planning', 4: 'Easy', 5: 'Very easy' };
export const regions = [
  { title: 'All places', ids: places.map(place => place.number) },
  { title: 'Frauenfeld & the Rhine', ids: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
  { title: 'Lucerne & Rigi', ids: [11, 12, 13, 14] },
  { title: 'Interlaken & Lake Thun', ids: [15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25] },
];
