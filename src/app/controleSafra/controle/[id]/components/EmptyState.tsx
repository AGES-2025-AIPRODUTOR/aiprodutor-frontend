import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TooltipArrow } from "@radix-ui/react-tooltip";

export function PlantingsEmptyState({ show }: { show: boolean }) {
  return (
    <div className="w-screen flex justify-center">
      <TooltipProvider>
        <Tooltip open={show}>
          <TooltipTrigger>
            <h1 className="text-center w-full text-xl text-green-700 font-bold px-12 leading-[1.1]">
              Plantios Vinculados
            </h1>
          </TooltipTrigger>
          <TooltipContent
            side="bottom"
            align="center"
            sideOffset={8}
            className="bg-green-500 text-white border-none shadow-lg rounded-md px-4 py-4 max-w-[90vw]"
          >
            <TooltipArrow className="fill-green-800" />
            <p className="relative text-center text-sm z-10 break-words max-w-[90vw]">
              Não há Nenhum Plantio Relacionado à Safra Selecionada
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}