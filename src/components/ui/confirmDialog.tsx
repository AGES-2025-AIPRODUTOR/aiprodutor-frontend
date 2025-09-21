"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button" // ajuste o caminho do seu Button

interface ConfirmDialogProps {
  isOpen: boolean
  description: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({ isOpen, description, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={val => { if (!val) onCancel() }}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg">
          <DialogPrimitive.Title className="text-lg font-semibold">Confirmação</DialogPrimitive.Title>
          <DialogPrimitive.Description className="mt-2 text-sm text-gray-600">
            {description}
          </DialogPrimitive.Description>

          {/* Botões centralizados */}
          <div className="mt-6 flex justify-center gap-4">
            <Button
              className="rounded-sm px-6 bg-white border hover:bg-gray-100 border-green-600 text-green-600"
              onClick={onCancel}
            >
              Cancelar
            </Button>
            <Button
              className="bg-green-600 text-white hover:bg-green-700 rounded-sm px-6"
              onClick={onConfirm}
            >
              Confirmar
            </Button>
          </div>

          <DialogPrimitive.Close className="absolute right-4 top-4 opacity-70 hover:opacity-100">
            <X className="w-4 h-4" />
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
