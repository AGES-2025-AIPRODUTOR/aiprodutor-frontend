'use client';
import GoogleMap from './components/GoogleMap'; // <- pega o index.tsx (wrapper)

export default function GerenciamentoArea() {
  return (
    <main style={{ padding: 16 }}>
      <h1>Mapa teste</h1>
      <GoogleMap
        zoom={16}
        center={{ lat: -30.0346, lng: -51.2177 }}
        onReady={(map) => console.log('Mapa pronto!', map)}
      />
    </main>
  );
}
