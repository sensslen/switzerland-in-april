import React, { Fragment, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { CircleMarker, MapContainer, Marker, Polyline, TileLayer, useMapEvents } from 'react-leaflet';
import { divIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './style.css';
import { kidsLabels, places, regions } from './trip.js';
import { placesInBounds, spreadPins } from './geo.js';
import { useCollapsingMap } from './useCollapsingMap.js';

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
  const resizing = useRef(false);
  const viewBounds = useRef(null);
  const map = useMapEvents({ moveend: updateBounds });
  function updateBounds() {
    if (resizing.current) return;
    const bounds = map.getBounds();
    viewBounds.current = bounds;
    onBounds({ south: bounds.getSouth(), north: bounds.getNorth(), west: bounds.getWest(), east: bounds.getEast() });
  }
  useEffect(updateBounds, [map, onBounds]);
  useEffect(() => {
    // Resizing the panel must not change which places the reader is exploring.
    const observer = new ResizeObserver(() => {
      resizing.current = true;
      map.invalidateSize({ pan: false });
      if (viewBounds.current) map.fitBounds(viewBounds.current, { animate: false });
      resizing.current = false;
    });
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);
  useEffect(() => {
    if (!view) return;
    if (view.place) map.setView([view.place.lat, view.place.lng], 14, { animate: false });
    else map.fitBounds(coordinates(places.filter(place => view.ids.includes(place.number))), { padding: [42, 42], animate: false });
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
  const image = place.photo;
  return <li value={place.number} id={`place-${place.number}`} className={`place${selected ? ' selected' : ''}`}>
    <a className={`photograph${place.photoFit === 'contain' ? ' photo-fit' : ''}`} href={image} target="_blank" rel="noreferrer" aria-label={`View photograph: ${place.caption}`} style={{ '--photo-url': `url("${image}")` }}>
      <img src={image} alt={place.caption} width={place.width} height={place.height} loading="lazy" decoding="async" style={{ objectPosition: place.photoPosition || 'center' }} />
    </a>
    <div className="place-copy">
      <div className="place-title"><span className="number" aria-hidden="true">{place.number}</span><h3>{place.title}</h3></div>
      <p className="category">{place.meta}</p>
      <p className="description">{place.body}</p>
      <p className="kids-rating"><span className="rating-dots" aria-hidden="true">{Array.from({ length: 5 }, (_, index) => <span key={index} className={index < place.kidsFeasibility ? 'filled' : ''} />)}</span> Kids feasibility {place.kidsFeasibility}/5 · {kidsLabels[place.kidsFeasibility]}</p>
      <p className="family-note">{place.familyNote}</p>
      {place.aprilNote && <p className="april-note"><strong>1 to 9 April:</strong> {place.aprilNote}</p>}
      <div className="place-actions">
        <button type="button" onClick={() => onLocate(place)}>Locate on map <span aria-hidden="true">↗</span></button>
        <a href={`https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`} target="_blank" rel="noreferrer">Google Maps <span aria-hidden="true">↗</span></a>
      </div>
      <div className="sources">{place.links.map(([title, url]) => <a key={url} href={url} target="_blank" rel="noreferrer">{title} <span aria-hidden="true">↗</span></a>)}</div>
      <details className="photo-credit"><summary>Photograph credit</summary><p>{place.credit.author} · {place.credit.license}. <a href={place.credit.source} target="_blank" rel="noreferrer">Original photograph</a>{place.credit.licenseUrl && <> · <a href={place.credit.licenseUrl} target="_blank" rel="noreferrer">Licence</a></>}. Loaded from Wikimedia Commons; cropped or fitted for display.</p></details>
    </div>
  </li>;
}

function App() {
  const [bounds, setBounds] = useState(null);
  const [view, setView] = useState(null);
  const [selected, setSelected] = useState(null);
  const { expanded, expandMap, toggleMap } = useCollapsingMap();
  const visible = placesInBounds(places, bounds);
  const select = number => {
    setSelected(number);
    document.getElementById(`place-${number}`)?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
  };
  const locate = place => {
    setSelected(place.number);
    setView({ place });
    document.getElementById('map-panel').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
  };

  return <>
    <a className="skip-link" href="#suggestions">Skip to places</a>
    <header className="intro"><div className="eyebrow"><svg className="swiss-flag" viewBox="0 0 32 32" role="img" aria-label="Swiss flag"><path fill="#da291c" d="M0 0h32v32H0z"/><path fill="#fff" d="M13 6h6v7h7v6h-7v7H6v-6h7z"/></svg> 1 to 9 April 2027 · {places.length} places</div><h1>Switzerland, in view.</h1><p>The Rhine, lakes and mountain villages, with practical notes for a family whose youngest child is three.</p><details className="trip-guide"><summary>How to read the kids ratings and plan for April</summary><p>Kids feasibility describes the effort and access for a family with a three-year-old: 5 very easy, 4 easy, 3 some planning, 2 demanding, 1 age restriction. It is separate from opening dates, weather and how much a place interests you. Every place stays on the map regardless of its rating.</p><p>Plan one main outing per day. Keep mountain days flexible for a clear forecast, and use the transport museum or Technorama for rainy days. Choose Goldau or Zurich Zoo for a wildlife day. Ballenberg opens on <a href="https://ballenberg.ch/en/about-us/museum/" target="_blank" rel="noreferrer">15 April 2027</a>, after this visit. St Beatus Caves has <a href="https://www.beatushoehlen.swiss/en/caves/families-with-children/" target="_blank" rel="noreferrer">297 steps and no pushchair access</a>, so it is a more demanding alternative for the youngest.</p></details></header>
    <section className="map-panel" id="map-panel" aria-label="Explore places on the map">
      <div className="map-tools"><div className="region-bar" aria-label="Jump to an area">{regions.map(region => <button key={region.title} type="button" onClick={() => { setSelected(null); setView({ ids: region.ids }); }}>{region.title}</button>)}</div><button className="map-size-toggle" type="button" aria-controls="trip-map" aria-expanded={expanded} onClick={toggleMap}>{expanded ? 'Shrink map' : 'Expand map'}</button></div>
      <div id="trip-map" onWheelCapture={() => { if (!expanded) flushSync(expandMap); }}>
        <MapContainer bounds={initialBounds} boundsOptions={{ padding: [16, 16] }} minZoom={6} maxZoom={18} scrollWheelZoom={true} className="map" aria-label="Map of suggested places in Switzerland" zoomControl={true}>
          <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" attribution={'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'} maxZoom={19} />
          <MapPlaces visible={visible} onBounds={setBounds} selected={selected} onSelect={select} view={view} />
        </MapContainer>
      </div>
      <div className="map-caption"><span>Drag to pan. Scroll over the map to expand and zoom; scroll the list to shrink or expand the map.</span><span>Numbers stay the same.</span></div>
    </section>
    <main id="suggestions" className="suggestions">
      <div className="list-heading"><h2>Places in view</h2><p role="status" aria-live="polite"><strong>{visible.length}</strong> of {places.length} places</p></div>
      {visible.length ? <ol className="places">{visible.map(place => <Place key={place.number} place={place} selected={place.number === selected} onLocate={locate} />)}</ol> : <div className="empty"><h3>No suggestions in this area</h3><p>The collection covers northeastern Switzerland, Lucerne and the Interlaken region.</p><button type="button" onClick={() => setView({ ids: regions[0].ids })}>Show all {places.length} places</button></div>}
    </main>
    <footer><p>For 1 to 9 April 2027. Opening information checked on 9 November 2026. Standing annual hours are distinguished from published 2027 dates; recheck operator notices before travelling. Photographs show different seasons. Dots indicate approximate locations; short lines connect spaced labels to their locations.</p><p>Map data © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap contributors</a>. Photographs retain their individual licences.</p></footer>
  </>;
}

createRoot(document.getElementById('root')).render(<App />);
