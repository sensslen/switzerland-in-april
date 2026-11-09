import { useEffect, useRef, useState } from 'react';

const mapSizes = () => ({ min: innerWidth <= 650 ? 110 : 140, max: Math.max(180, Math.min(520, innerHeight / 2)) });

export function useCollapsingMap() {
  const [height, setHeight] = useState(() => mapSizes().max);
  const currentHeight = useRef(height);
  const sizes = useRef(mapSizes());

  const resizeMap = next => {
    currentHeight.current = Math.max(sizes.current.min, Math.min(sizes.current.max, next));
    setHeight(currentHeight.current);
  };

  useEffect(() => {
    let previousScroll = scrollY;
    let touch = null;
    const onScroll = () => {
      const next = Math.max(0, scrollY);
      resizeMap(currentHeight.current - (next - previousScroll));
      previousScroll = next;
    };
    const expandFirst = (event, delta) => {
      if (delta >= 0 || scrollY <= 0 || event.target.closest('select, input, textarea, [contenteditable="true"]') ||
        (event.type === 'touchmove' && event.target.closest('.leaflet-container'))) return;
      const growth = Math.min(-delta, sizes.current.max - currentHeight.current);
      if (growth <= 0 || !event.cancelable) return;
      event.preventDefault();
      resizeMap(currentHeight.current + growth);
      if (delta + growth < 0) window.scrollBy(0, delta + growth);
    };
    const onWheel = event => {
      if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1;
      expandFirst(event, event.deltaY * unit);
    };
    const onTouchStart = event => {
      touch = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
    };
    const onTouchMove = event => {
      if (event.touches.length !== 1 || !touch) return;
      const next = { x: event.touches[0].clientX, y: event.touches[0].clientY };
      if (Math.abs(next.y - touch.y) > Math.abs(next.x - touch.x)) expandFirst(event, touch.y - next.y);
      touch = next;
    };
    const onResize = () => {
      const wasExpanded = currentHeight.current >= sizes.current.max;
      sizes.current = mapSizes();
      resizeMap(wasExpanded ? sizes.current.max : currentHeight.current);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--map-height', `${height}px`);
    return () => document.documentElement.style.removeProperty('--map-height');
  }, [height]);

  const expanded = height >= sizes.current.max;
  return { expanded, toggleMap: () => resizeMap(expanded ? sizes.current.min : sizes.current.max) };
}
