import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Accommodation } from '../types';

interface LeafletMapProps {
  accommodations: Accommodation[];
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export default function LeafletMap({ accommodations }: LeafletMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    mapRef.current = L.map(containerRef.current, {
      center: [41.3851, 2.1734],
      zoom: 5
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapRef.current);

    markersRef.current = L.layerGroup().addTo(mapRef.current);

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      markersRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !markersRef.current) {
      return;
    }

    markersRef.current.clearLayers();

    if (accommodations.length === 0) {
      return;
    }

    const bounds = L.latLngBounds([]);

    accommodations.forEach((acc) => {
      const image = acc.images[0] ?? '';
      const popupHtml = `
        <div class="map-popup">
          ${image ? `<img src="${image}" alt="${escapeHtml(acc.name)}" />` : ''}
          <strong>${escapeHtml(acc.name)}</strong>
          <span>${escapeHtml(acc.type)} in ${escapeHtml(acc.location)}</span>
          <span>${acc.roomsAvailableToday} rooms available today</span>
        </div>
      `;
      const marker = L.marker([acc.latitude, acc.longitude]).bindPopup(popupHtml);
      marker.addTo(markersRef.current!);
      bounds.extend([acc.latitude, acc.longitude]);
    });

    if (bounds.isValid()) {
      mapRef.current.fitBounds(bounds.pad(0.2));
    }
  }, [accommodations]);

  return <div className="map" ref={containerRef} />;
}
