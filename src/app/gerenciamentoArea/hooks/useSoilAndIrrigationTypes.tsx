/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { getAllSoilTypes, getAllIrrigationTypes, SoilTypesEntity, IrrigationTypeEntity } from "@/service/areas";

export function useSoilAndIrrigationTypes() {
  const [soilTypes, setSoilTypes] = useState<SoilTypesEntity[]>([]);
  const [irrigationTypes, setIrrigationTypes] = useState<IrrigationTypeEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        const [soilsRes, irrigationRes] = await Promise.all([
          getAllSoilTypes(),
          getAllIrrigationTypes(),
        ]);

        if (soilsRes.isSuccess && soilsRes.response) {
          setSoilTypes(soilsRes.response);
        }
        if (irrigationRes.isSuccess && irrigationRes.response) {
          setIrrigationTypes(irrigationRes.response);
        }

      } catch (err: any) {
        setError(err.message ?? "Erro ao carregar tipos");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { soilTypes, irrigationTypes, loading, error };
}
