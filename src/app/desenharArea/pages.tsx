'use client';

import FreehandPolygonDrawer from '../gerenciamentoArea/components/GoogleMap/FreehandDrawer';

export default function MapaAreasPage() {
  return (
    <main className="px-4 py-6">
      <h1 className="text-lg font-semibold">Desenhar área de plantio</h1>
      <p className="text-sm text-gray-400 mb-3">Desenhe no mapa e confirme.</p>

      <FreehandPolygonDrawer
        center={{ lat: -30.0346, lng: -51.2177 }}
        zoom={17}
        mapHeight={560}
        onConfirm={({ path, areaM2 }) => {
          // Futuramente ele vai ficar aqui o metodo de salvar os dados salvos pelo desenho a mão livre e como eles serão tratados
          console.log('Área (m²):', Math.round(areaM2));
          console.log('Coordenadas:', path);
        }}
      />
    </main>
  );
}
