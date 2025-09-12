// context/PolygonContext.tsx
'use client';
import { createContext, useContext, useState } from 'react';

type LatLng = { lat: number; lng: number };

type PolygonCtx = {
  polygon: LatLng[] | null;
  setPolygon: (p: LatLng[] | null) => void;
};

const PolygonContext = createContext<PolygonCtx | null>(null);

export function PolygonProvider({ children }: { children: React.ReactNode }) {
  const [polygon, setPolygon] = useState<LatLng[] | null>(null);
  return (
    <PolygonContext.Provider value={{ polygon, setPolygon }}>
      {children}
    </PolygonContext.Provider>
  );
}

export function usePolygon() {
  const ctx = useContext(PolygonContext);
  if (!ctx) throw new Error('usePolygon deve estar dentro do PolygonProvider');
  return ctx;
}
