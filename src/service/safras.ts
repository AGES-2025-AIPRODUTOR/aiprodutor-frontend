import type { AreasEntity } from '@/service/areas';

export type PlantioEntity = {
  id: number;
  safraId: number;
  inicio: string;               // ISO
  fim: string;                  // ISO
  produtoNome: string;
  quantidadePlantadaKg: number | null;
  areaIds: number[];
};

export type SafraEntity = {
  id: number;
  nome: string;
  inicio: string;               // ISO
  fim: string;                  // ISO
  areas: AreasEntity[];
  plantios: PlantioEntity[];
};

export type SafraUpdate = {
  nome: string;
  inicio: string;
  fim: string;
  areaIds: number[];
};

export type PlantioUpdate = {
  inicio: string;
  fim: string;
  produtoNome: string;
  quantidadePlantadaKg: number | null;
  areaIds: number[];
};

// ---------- MOCK abaixo (sem integração) ----------
const wait = (ms=400)=> new Promise(r=>setTimeout(r,ms));

// base em memória (os juniores trocam por API depois)
// eslint-disable-next-line prefer-const
let _db: Record<number, SafraEntity> = {
  1: {
    id: 1,
    nome: 'Safra de Laranja 25/26',
    inicio: '2025-08-01',
    fim: '2026-08-01',
    areas: [
      { id: 10, name: 'Tomates tomatudos', producerId: 1, isActive: true, soilTypeId: 1, irrigationTypeId: 1, polygon: {type:'Polygon',coordinates:[[]]}, createdAt:'', updatedAt:'' },
      { id: 11, name: 'Tomates não tomatudos', producerId: 1, isActive: true, soilTypeId: 2, irrigationTypeId: 1, polygon: {type:'Polygon',coordinates:[[]]}, createdAt:'', updatedAt:'' },
    ],
    plantios: [
      { id:101, safraId:1, inicio:'2025-08-01', fim:'2026-01-01', produtoNome:'1º plantio de laranja', quantidadePlantadaKg:100, areaIds:[10] },
      { id:102, safraId:1, inicio:'2026-02-01', fim:'2026-07-01', produtoNome:'2º plantio de laranja', quantidadePlantadaKg:120, areaIds:[10,11] },
    ],
  },
};

// helpers
const clone = <T,>(x:T)=> JSON.parse(JSON.stringify(x));

// ---------- Funções que as páginas já usam ----------
export async function getSafraById(id: number) {
  await wait();
  const s = _db[id];
  return s ? { isSuccess: true as const, response: clone(s) } :
             { isSuccess: false as const, errorMessage: 'Safra não encontrada' };
}

export async function updateSafra(id: number, body: SafraUpdate) {
  await wait();
  console.info('[TODO integrar] updateSafra', id, body);
  if (!_db[id]) return { isSuccess:false as const, errorMessage:'Safra não encontrada' };
  _db[id] = { ..._db[id], nome: body.nome, inicio: body.inicio, fim: body.fim,
              areas: _db[id].areas.filter(a => body.areaIds.includes(a.id)) };
  return { isSuccess:true as const, response: clone(_db[id]) };
}

export async function getPlantioById(plantioId: number) {
  await wait();
  const safra = Object.values(_db).find(s => s.plantios.some(p => p.id === plantioId));
  const p = safra?.plantios.find(p => p.id === plantioId);
  return p ? { isSuccess:true as const, response: clone(p) } :
             { isSuccess:false as const, errorMessage:'Plantio não encontrado' };
}

export async function updatePlantio(plantioId: number, body: PlantioUpdate) {
  await wait();
  console.info('[TODO integrar] updatePlantio', plantioId, body);
  const safra = Object.values(_db).find(s => s.plantios.some(p => p.id === plantioId));
  if (!safra) return { isSuccess:false as const, errorMessage:'Plantio não encontrado' };
  safra.plantios = safra.plantios.map(p => p.id === plantioId ? { ...p, ...body } : p);
  return { isSuccess:true as const, response: clone(safra.plantios.find(p => p.id === plantioId)!) };
}

export async function deactivatePlantio(plantioId: number) {
  await wait();
  console.info('[TODO integrar] deactivatePlantio', plantioId);
  const safra = Object.values(_db).find(s => s.plantios.some(p => p.id === plantioId));
  if (!safra) return { isSuccess:false as const, errorMessage:'Plantio não encontrado' };
  safra.plantios = safra.plantios.filter(p => p.id !== plantioId);
  return { isSuccess:true as const };
}
