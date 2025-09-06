'use client';

import PageTitle from "@/components/PageTitle";
import { Info } from "lucide-react";

type Inputs = {
  areaName: string
  soilType: string
  irrigationType: string
}


export default function EditArea() {
  return (
    <div>
      <PageTitle title={'Edição'} href={'/gerenciamentoArea'} Icon={Info} variant={'left-icon'} />
    </div>
  );
}
