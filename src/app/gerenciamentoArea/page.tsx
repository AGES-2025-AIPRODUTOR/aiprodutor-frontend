'use client';
import { useState } from 'react';
import GoogleMap from './components/GoogleMap';
import LocationInput from './components/GoogleMap/LocationInput';

interface Location {
  lat: number;
  lng: number;
}

export default function GerenciamentoArea() {
  const [center, setCenter] = useState<Location>({ lat: -30.0346, lng: -51.2177 });
  const [isMapReady, setIsMapReady] = useState(false);

  const handleLocationSelected = (newLocation: Location) => {
    setCenter(newLocation);
  };

  return (
    <main className="p-4 text-center">
      <h1 className="text-2xl font-semibold mb-4 text-green-600">Endereço de suas plantações</h1>
      
      {isMapReady && (
        <LocationInput onLocationSelected={handleLocationSelected} />
      )}
      
      <GoogleMap
        zoom={16}
        center={center}
        onReady={() => setIsMapReady(true)}
      />
    </main>
  );
}
