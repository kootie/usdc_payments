'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface Business {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  category: string;
  address: string;
}

interface BusinessMapProps {
  businesses: Business[];
  onBusinessSelect: (business: Business) => void;
}

export default function BusinessMap({ businesses, onBusinessSelect }: BusinessMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    console.log('Mapbox token exists:', !!token);
    console.log('Token length:', token?.length);

    if (!token) {
      setError('Mapbox token is missing. Please check your environment variables.');
      return;
    }

    if (!mapContainer.current) {
      console.error('Map container ref is not available');
      return;
    }

    try {
      console.log('Initializing Mapbox...');
      mapboxgl.accessToken = token;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [-0.127758, 51.507351], // London coordinates
        zoom: 12
      });

      map.current.on('load', () => {
        console.log('Map loaded successfully');
        setMapLoaded(true);
      });

      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
        setError(`Mapbox error: ${e.error?.message || 'Unknown error'}`);
      });

    } catch (err) {
      console.error('Error initializing map:', err);
      setError(`Failed to initialize map: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (!mapLoaded || !map.current) {
      console.log('Map not ready for markers:', { mapLoaded, mapExists: !!map.current });
      return;
    }

    console.log('Adding markers for businesses:', businesses.length);

    // Remove existing markers
    const markers = document.getElementsByClassName('mapboxgl-marker');
    while (markers[0]) {
      markers[0].remove();
    }

    // Add new markers
    businesses.forEach(business => {
      try {
        const el = document.createElement('div');
        el.className = 'marker';
        el.style.width = '20px';
        el.style.height = '20px';
        el.style.backgroundColor = '#3B82F6';
        el.style.borderRadius = '50%';
        el.style.border = '2px solid white';
        el.style.boxShadow = '0 0 4px rgba(0,0,0,0.3)';
        el.style.cursor = 'pointer';

        new mapboxgl.Marker(el)
          .setLngLat([business.location.lng, business.location.lat])
          .setPopup(new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <h3 class="font-bold">${business.name}</h3>
              <p class="text-sm">${business.category}</p>
            `))
          .addTo(map.current!);

        el.addEventListener('click', () => {
          onBusinessSelect(business);
        });
      } catch (err) {
        console.error('Error adding marker for business:', business.name, err);
      }
    });

    // Fit map to show all markers
    if (businesses.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      businesses.forEach(business => {
        bounds.extend([business.location.lng, business.location.lat]);
      });
      map.current.fitBounds(bounds, { padding: 50 });
    }
  }, [businesses, mapLoaded, onBusinessSelect]);

  if (error) {
    return (
      <div className="w-full h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-red-500 text-center p-4">
          <p className="font-bold">Error loading map:</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
} 