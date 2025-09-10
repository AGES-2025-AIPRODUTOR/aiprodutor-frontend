'use client';
import { useState } from 'react';
import GoogleMap from '../components/GoogleMap';
import LocationInput from '../components/GoogleMap/LocationInput';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import CadastroAreaWrapper from '../CadastroArea/page'

interface Location {
  lat: number;
  lng: number;
}

export default function MapaAreas() {
  const [center, setCenter] = useState<Location>({ lat: -30.0346, lng: -51.2177 });
  const [isMapReady, setIsMapReady] = useState(false);

  const handleLocationSelected = (newLocation: Location) => {
    setCenter(newLocation);
  };

  return (
    <div className="h-full w-full">
      <div className="absolute z-10 top-30 p-1 m-2 rounded-full bg-white">
        <Link href={'/gerenciamentoArea'}>
          <ChevronLeft className="w-10 h-10 sticky text-gray-600 translate-x-[-2px]" />
        </Link>
      </div>
      <main className="p-4 text-center h-full w-full">
        <h1 className="text-2xl font-semibold mb-4 text-green-600">Endereço de suas plantações</h1>
        {isMapReady && <LocationInput onLocationSelected={handleLocationSelected} />}
        <div className="w-full h-full overflow-hidden shadow">
          <GoogleMap zoom={16} center={center} onReady={() => setIsMapReady(true)} />
        </div>
        <div>
          <CadastroAreaWrapper />
        </div>
      </main>
    </div>
  );
}
