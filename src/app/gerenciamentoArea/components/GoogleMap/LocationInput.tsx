'use client';

import { usePlacesWidget } from "react-google-autocomplete";

interface Location {
  lat: number;
  lng: number;
}

interface LocationInputProps {
  onLocationSelected: (location: Location) => void;
}

export default function LocationInput({ onLocationSelected }: LocationInputProps) {
  const { ref, autocompleteRef } = usePlacesWidget({
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    onPlaceSelected: (place) => {
      try {
        if (place.geometry?.location) {
          onLocationSelected({
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          });
        }
      } catch (err) {
        console.error('Erro ao selecionar lugar:', err);
      }
    },
    options: { types: ['geocode'] },
  });

  return (
    <input
      type="text"
      placeholder="Digite sua localização"
      ref={ref}
      className="w-4/5 max-w-md px-3 py-2 border border-gray-300 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-green-500"
    />
  );
}