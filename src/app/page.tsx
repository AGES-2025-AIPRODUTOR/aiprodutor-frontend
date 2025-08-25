'use client';
import GoogleMap from '@/components/GoogleMap';

export default function Home() {
  return (
    <main style={{ padding: 16 }}>
      <h1>Mapa teste</h1>
      <GoogleMap
        onReady={(map: google.maps.Map) => console.log('Mapa pronto!', map)}
        onPolygonComplete={({ areaM2 }) =>
          alert(`Área: ${(areaM2 / 1_000_000).toFixed(4)} km²`)
        }
      />
    </main>
  );
}
