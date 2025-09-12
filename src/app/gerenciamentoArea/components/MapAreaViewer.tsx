'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import GoogleMapWrapper from './GoogleMap/index';
import { EditAreaForm } from './AreaInfosForm';
import {
  getSoilTypeById,
  getIrrigationTypeById,
  getAreaById,
  getAllAreas,
  AreasEntity,
} from '@/service/areas';
import { useAgriculturalProducerContext } from '@/context/AgriculturalProducerContext';

interface MapAreaViewerProps {
  selectedAreaId?: number;
  soilTypeId?: number;
  irrigationTypeId?: number;
  onBack: () => void;
  refetch?: () => void;
}

export default function MapAreaViewer({
  selectedAreaId,
  soilTypeId,
  irrigationTypeId,
  onBack,
  refetch,
}: MapAreaViewerProps) {
  const [areas, setAreas] = useState<AreasEntity[]>([]);
  const [selectedArea, setSelectedArea] = useState<AreasEntity | null>(null);
  const [soilTypeName, setSoilTypeName] = useState<string>('');
  const [irrigationTypeName, setIrrigationTypeName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [isDrawerVisible, setIsDrawerVisible] = useState<boolean>(false);
  const { data } = useAgriculturalProducerContext();

  useEffect(() => {
    const fetchAllAreas = async () => {
      try {
        const { isSuccess, response } = await getAllAreas(data.id ?? 0);
        if (isSuccess && response) {
          setAreas(response);
        }
      } catch (error) {
        console.error('Erro ao buscar todas as áreas:', error);
      }
    };

    fetchAllAreas();
  }, []);

  useEffect(() => {
    const fetchSelectedAreaData = async () => {
      if (!selectedAreaId) return;

      setLoading(true);

      try {
        const { isSuccess, response } = await getAreaById(selectedAreaId);
        if (isSuccess && response) {
          setSelectedArea(response);
        }
      } catch (error) {
        console.error('Erro ao buscar dados da área selecionada:', error);
      }

      setLoading(false);
    };

    fetchSelectedAreaData();
  }, [selectedAreaId]);

  useEffect(() => {
    const fetchTypeNames = async () => {
      if (soilTypeId) {
        try {
          const { isSuccess, response } = await getSoilTypeById(soilTypeId);
          if (isSuccess && response) {
            setSoilTypeName(response.name);
          }
        } catch (error) {
          console.error('Erro ao buscar tipo de solo:', error);
        }
      }

      if (irrigationTypeId) {
        try {
          const { isSuccess, response } = await getIrrigationTypeById(irrigationTypeId);
          if (isSuccess && response) {
            setIrrigationTypeName(response.name);
          }
        } catch (error) {
          console.error('Erro ao buscar tipo de irrigação:', error);
        }
      }
    };

    fetchTypeNames();
  }, [soilTypeId, irrigationTypeId]);

  useEffect(() => {
    if (selectedAreaId && !loading) {
      const timer = setTimeout(() => {
        setIsDrawerVisible(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [selectedAreaId, loading]);

  const handleAreaClick = (area: AreasEntity) => {
    setSelectedArea(area);
    setIsDrawerVisible(true);

    if (area.soilTypeId) {
      getSoilTypeById(area.soilTypeId).then(({ isSuccess, response }) => {
        if (isSuccess && response) {
          setSoilTypeName(response.name);
        }
      });
    }

    if (area.irrigationTypeId) {
      getIrrigationTypeById(area.irrigationTypeId).then(({ isSuccess, response }) => {
        if (isSuccess && response) {
          setIrrigationTypeName(response.name);
        }
      });
    }
  };

  if (loading && selectedAreaId) {
    return (
      <div className="h-screen flex flex-col lg:flex-row">
        <div className="flex-1 relative">
          <GoogleMapWrapper center={{ lat: -30.0346, lng: -51.2177 }} zoom={12} height="100%" />
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 lg:top-8">
            <div className="bg-white p-4 rounded-xl shadow-2xl border border-gray-100 mx-4 backdrop-blur-sm">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-green-500 border-t-transparent"></div>
                <p className="text-sm text-gray-700 font-medium">Carregando dados da área...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col lg:flex-row relative">
      <div className="flex-1 relative">
        <GoogleMapWrapper
          center={
            selectedArea?.polygon
              ? {
                  lat: selectedArea.polygon.coordinates[0][0][1],
                  lng: selectedArea.polygon.coordinates[0][0][0],
                }
              : { lat: -30.0346, lng: -51.2177 }
          }
          zoom={selectedArea ? 15 : 12}
          height="100%"
        />

        <div className="absolute top-4 left-4 z-20">
          <Button
            onClick={onBack}
            className="bg-green-600 hover:bg-green-700 border border-green-600 text-white"
          >
            Voltar
          </Button>
        </div>

        {!selectedAreaId && (
          <div className="absolute top-12 right-4 z-20 flex flex-col gap-2 max-h-[50vh] overflow-y-auto">
            <div className="bg-white p-2 rounded-lg shadow-lg">
              <p className="text-xs text-gray-600 mb-2 font-semibold">Áreas Disponíveis:</p>
              {areas.map((area) => (
                <Button
                  key={area.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handleAreaClick(area)}
                  className="w-full mb-1 text-left justify-start"
                >
                  {area.name || `Área ${area.id}`}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {(selectedAreaId || selectedArea) && (
        <div
          className={`
            overflow-y-auto p-2 
            absolute bottom-0 left-0 right-0 
            bg-white rounded-t-2xl
            transition-transform duration-500 ease-out
            ${isDrawerVisible ? 'transform translate-y-0' : 'transform translate-y-full'}
            lg:relative lg:translate-y-0 lg:w-96 lg:rounded-none lg:border-l lg:border-gray-200
          `}
        >
          <EditAreaForm
            areaId={selectedAreaId || selectedArea?.id || 0}
            areaName={selectedArea?.name || ''}
            soilTypeName={soilTypeName}
            irrigationTypeName={irrigationTypeName}
            refetch={refetch}
          />
        </div>
      )}
    </div>
  );
}
