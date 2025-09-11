'use client';
import FreeDrawMap, { LatLng, SavedPoly } from '../components/GoogleMap/FreeDrawMap';

export default function DesenharAreaPage() {
  // exemplo: polígonos que você trouxe do back
  const saved: SavedPoly[] = [
    // { id: '1', color: '#ef4444', path: [{lat:..., lng:...}, ...] }
  ];

  return (
    <div >
      <FreeDrawMap
        savedPolys={saved}
        onPolygonComplete={({ path, areaM2, color }) => {
          console.log('Polígono:', path);
          console.log('Área (m²):', Math.round(areaM2));
          console.log('Cor:', color);
          // ➜ POST para o back com { path, areaM2, color }
        }}
      />
    </div>
  );
}
