import React, { Fragment, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { CircleMarker, MapContainer, Marker, Polyline, TileLayer, useMapEvents } from 'react-leaflet';
import { divIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './style.css';
import places from './places.json';
import { placesInBounds, spreadPins } from './geo.js';

const regions = [
  { title: 'All places', ids: places.map(place => place.number) },
  { title: 'Frauenfeld & the Rhine', ids: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
  { title: 'Lucerne & Rigi', ids: [10, 11, 12] },
  { title: 'Interlaken region', ids: places.filter(place => place.number >= 13).map(place => place.number) },
];
const coordinates = subset => subset.map(place => [place.lat, place.lng]);
const initialBounds = coordinates(places);
const icons = new Map(places.flatMap(place => [false, true].map(active => [
  `${place.number}-${active}`,
  divIcon({
    className: `place-pin${active ? ' active' : ''}`,
    html: `<span class="pin-number" aria-hidden="true">${place.number}</span><span class="sr-only">${place.number}. ${place.title}</span>`,
    iconSize: [32, 32], iconAnchor: [16, 16],
  }),
])));

function MapPlaces({ visible, onBounds, selected, onSelect, view }) {
  const map = useMapEvents({ moveend: updateBounds, resize: updateBounds });
  function updateBounds() {
    const bounds = map.getBounds();
    onBounds({ south: bounds.getSouth(), north: bounds.getNorth(), west: bounds.getWest(), east: bounds.getEast() });
  }
  useEffect(updateBounds, [map, onBounds]);
  useEffect(() => {
    if (!view) return;
    if (view.place) map.setView([view.place.lat, view.place.lng], 14);
    else map.fitBounds(coordinates(places.filter(place => view.ids.includes(place.number))), { padding: [42, 42] });
  }, [map, view]);

  const { x: width, y: height } = map.getSize();
  const pins = spreadPins(visible.map(place => {
    const point = map.latLngToContainerPoint([place.lat, place.lng]);
    return { ...place, x: point.x, y: point.y };
  }), width, height);

  return pins.map(pin => {
    const position = map.containerPointToLatLng([pin.px, pin.py]);
    const active = pin.number === selected;
    return <Fragment key={pin.number}>
      <Polyline positions={[[pin.lat, pin.lng], position]} interactive={false} pathOptions={{ color: '#173f3c', weight: 1.5, opacity: 0.65 }} />
      <CircleMarker center={[pin.lat, pin.lng]} radius={2.5} interactive={false} pathOptions={{ color: '#173f3c', fillOpacity: 1, weight: 1 }} />
      <Marker position={position} title={`${pin.number}. ${pin.title}`} alt={`${pin.number}. ${pin.title}`}
        icon={icons.get(`${pin.number}-${active}`)}
        eventHandlers={{ click: () => onSelect(pin.number) }} />
    </Fragment>;
  });
}

function Place({ place, selected, onLocate }) {
  const image = `${import.meta.env.BASE_URL}${place.photo}`;
  return <li value={place.number} id={`place-${place.number}`} className={`place${selected ? ' selected' : ''}`}>
    <a className="photograph" href={image} target="_blank" rel="noreferrer" aria-label={`View photograph: ${place.caption}`}>
      <img src={image} alt={place.caption} width={place.width} height={place.height} loading="lazy" decoding="async" />
    </a>
    <div className="place-copy">
      <div className="place-title"><span className="number" aria-hidden="true">{place.number}</span><h3>{place.title}</h3></div>
      <p className="category">{place.meta}</p>
      <p className="description">{place.body}</p>
      <div className="place-actions">
        <button type="button" onClick={() => onLocate(place)}>Locate on map <span aria-hidden="true">↗</span></button>
        <a href={`https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`} target="_blank" rel="noreferrer">Google Maps <span aria-hidden="true">↗</span></a>
      </div>
      <div className="sources">{place.links.map(([title, url]) => <a key={url} href={url} target="_blank" rel="noreferrer">{title} <span aria-hidden="true">↗</span></a>)}</div>
      <details className="photo-credit"><summary>Photograph credit</summary><p>{place.credit.author} · {place.credit.license}. <a href={place.credit.source} target="_blank" rel="noreferrer">Original photograph</a>{place.credit.licenseUrl && <> · <a href={place.credit.licenseUrl} target="_blank" rel="noreferrer">Licence</a></>}. Resized and converted to WebP.</p></details>
    </div>
  </li>;
}

function App() {
  const [bounds, setBounds] = useState(null);
  const [view, setView] = useState(null);
  const [selected, setSelected] = useState(null);
  const visible = placesInBounds(places, bounds);
  const select = number => {
    setSelected(number);
    document.getElementById(`place-${number}`)?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
  };
  const locate = place => {
    setSelected(place.number);
    setView({ place });
    document.getElementById('map-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return <>
    <a className="skip-link" href="#suggestions">Skip to places</a>
    <header className="intro"><div className="eyebrow"><span className="swiss-cross" aria-hidden="true">✚</span> 1 to 9 April 2027 · {places.length} places</div><h1>Switzerland, in view.</h1><p>The Rhine, orchard country, lakes and mountain villages. Explore the map to see the places nearby.</p></header>
    <section className="map-panel" id="map-panel" aria-label="Explore places on the map">
      <div className="region-bar" aria-label="Jump to an area">{regions.map(region => <button key={region.title} type="button" onClick={() => { setSelected(null); setView({ ids: region.ids }); }}>{region.title}</button>)}</div>
      <MapContainer bounds={initialBounds} boundsOptions={{ padding: [16, 16] }} minZoom={6} maxZoom={18} className="map" aria-label="Map of suggested places in Switzerland" zoomControl={true}>
        <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" attribution={'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'} maxZoom={19} />
        <MapPlaces visible={visible} onBounds={setBounds} selected={selected} onSelect={select} view={view} />
      </MapContainer>
      <div className="map-caption"><span>Pan or zoom to explore. Select a number to find its place below.</span><span>Numbers stay the same.</span></div>
    </section>
    <main id="suggestions" className="suggestions">
      <div className="list-heading"><h2>Places in view</h2><p role="status" aria-live="polite"><strong>{visible.length}</strong> of {places.length} places</p></div>
      {visible.length ? <ol className="places">{visible.map(place => <Place key={place.number} place={place} selected={place.number === selected} onLocate={locate} />)}</ol> : <div className="empty"><h3>No suggestions in this area</h3><p>The collection covers northeastern Switzerland, Lucerne and the Interlaken region.</p><button type="button" onClick={() => setView({ ids: regions[0].ids })}>Show all {places.length} places</button></div>}
    </main>
    <footer><p>For 1 to 9 April 2027. Opening information checked on 6 November 2026. Photographs show different seasons. Dots indicate approximate locations; short lines connect spaced labels to their locations.</p><p>Map data © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap contributors</a>. Photographs retain their individual licences.</p></footer>
  </>;
}

createRoot(document.getElementById('root')).render(<App />);
