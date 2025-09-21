import SelecionarArea, {Area} from "@/components/ui/SelectAreas"
export default function CadastrarSafra() {

  {/*Somente para testes antes de ter o modal de lista */}
   const minhasAreas: Area[] = [
      {id: 1, nome: "Plantação orgânica de tomates cereja irrigados por gotejamento", componente: <div className="h-5 w-5 border border-black"></div> },
      {id: 2, nome: "Plantação de banana", componente: <div className="h-5 w-5 border border-black"></div>},
      {id: 3, nome: "Cultivo protegido de alfaces hidropônicas em estufa climatizada", componente: <div className="h-5 w-5 border border-black"></div> },
      {id: 4, nome: "Área de produção de morangos com manejo integrado de pragas", componente: <div className="h-5 w-5 border border-black"></div> },
      {id: 5, nome: "Horta de ervas aromáticas para uso culinário e medicinal", componente: <div className="h-5 w-5 border border-black"></div> },
    ]

  return (
    <div className="flex justify-center p-4">
      <SelecionarArea areas={minhasAreas} />
    </div>
  )
}