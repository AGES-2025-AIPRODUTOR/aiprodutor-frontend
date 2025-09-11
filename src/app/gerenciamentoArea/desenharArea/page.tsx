'use client';

import PageTitle from '@/components/PageTitle';
import FreeDrawMap from '../components/GoogleMap/FreeDrawMap';

export default function DesenharAreaPage() {
  return (
    <div className="flex flex-col h-screen">
      <FreeDrawMap
        onPolygonComplete={(path, area) => {
          // aqui você pode salvar no backend
          // ex: POST para /areas com { path, areaM2: area }
          console.log('Polígono:', path);
          console.log('Área (m²):', Math.round(area));
        }}
      />
    </div>
  );
}
