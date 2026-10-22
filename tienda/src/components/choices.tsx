"use client"

import { Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { COLORS, isLightColor, MAX_COLORS } from "@/lib/catalog"
import { cn } from "cn"

export function ColorSwatches({
  value,
  onChange,
  multiple = false,
  label = "Colores",
}: {
  value: string[]
  onChange: (ids: string[]) => void
  multiple?: boolean
  label?: string
}) {
  function toggle(id: string) {
    if (!multiple) {
      onChange([id])
      return
    }
    if (value.includes(id)) {
      if (value.length === 1) return
      onChange(value.filter((item) => item !== id))
      return
    }
    if (value.length >= MAX_COLORS) return
    onChange([...value, id])
  }

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <p className="text-sm font-medium" id={`${label}-label`}>
          {label}
        </p>
        {multiple && (
          <p className="text-xs text-muted-foreground">Hasta {MAX_COLORS}</p>
        )}
      </div>
      <div className="flex flex-wrap gap-2" role="group" aria-labelledby={`${label}-label`}>
        {COLORS.map((color) => {
          const selected = value.includes(color.id)
          return (
            <button
              key={color.id}
              type="button"
              aria-pressed={selected}
              aria-label={color.name}
              onClick={() => toggle(color.id)}
              className={cn(
                "flex items-center gap-2 rounded-full border py-1 pr-3 pl-1 text-sm transition",
                selected
                  ? "border-wine bg-accent text-wine"
                  : "border-border bg-card text-foreground hover:bg-muted",
              )}
            >
              <span
                className={cn(
                  "size-6 rounded-full ring-1 ring-black/10",
                  isLightColor(color.id) && "ring-black/20",
                )}
                style={{ backgroundColor: color.hex }}
              />
              {color.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function ChoiceCards({
  legend,
  value,
  onChange,
  options,
}: {
  legend: string
  value: string
  onChange: (id: string) => void
  options: { id: string; title: string; detail?: string }[]
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium">{legend}</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((option) => {
          const selected = value === option.id
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option.id)}
              className={cn(
                "rounded-xl border px-3 py-2 text-left transition",
                selected ? "border-wine bg-accent" : "border-border bg-card hover:bg-muted",
              )}
            >
              <span className="block text-sm font-medium">{option.title}</span>
              {option.detail && (
                <span className="mt-0.5 block text-xs text-muted-foreground">{option.detail}</span>
              )}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

export function QuantityStepper({
  value,
  min = 1,
  max,
  onChange,
  label,
}: {
  value: number
  min?: number
  max: number
  onChange: (value: number) => void
  label: string
}) {
  return (
    <div className="inline-flex items-center rounded-full border border-border bg-card">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={`Disminuir ${label}`}
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
      >
        <Minus />
      </Button>
      <span className="w-8 text-center text-sm tabular-nums" aria-live="polite">
        {value}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={`Aumentar ${label}`}
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
      >
        <Plus />
      </Button>
    </div>
  )
}
