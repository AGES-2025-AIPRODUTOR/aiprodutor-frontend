import * as React from "react"
import { cn } from "@/lib/utils"

type InputProps = React.ComponentProps<"input"> & {
  unit?: "kg" // no futuro você pode adicionar mais unidades
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, unit, ...props }, ref) => {
    const [value, setValue] = React.useState("")

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let txt = e.target.value

      if (unit === "kg") {
        const suffix = " kg"

        // remove sufixo se o usuário apagar manualmente
        if (txt.endsWith(suffix)) {
          txt = txt.slice(0, -suffix.length)
        }

        // regex: mantém apenas números, vírgula ou ponto
        txt = txt.replace(/[^\d.,]/g, "")

        // normaliza para vírgula como separador decimal
        const [int, dec = ""] = txt.split(/[.,]/)
        txt = dec ? `${int},${dec.slice(0, 2)}` : int

        setValue(txt ? `${txt}${suffix}` : "")
      } else {
        // comportamento padrão sem unidade
        setValue(txt)
      }
    }

    return (
      <input
        type={type}
        ref={ref}
        value={value}
        onChange={handleChange}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        {...props}
      />
    )
  }
)

Input.displayName = "Input"

export { Input }
