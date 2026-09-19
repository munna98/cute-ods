'use client'

import * as React from "react"
import { ChevronDown, Check } from "lucide-react"

export interface SelectOption {
  value: string
  label: string
  icon?: React.ReactNode
  description?: string
  badge?: React.ReactNode
  disabled?: boolean
}

export interface CustomSelectProps {
  name?: string
  value?: string
  onChange?: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
  required?: boolean
  className?: string
}

export function CustomSelect({
  name,
  value: initialValue,
  onChange,
  options,
  placeholder = "Select an option...",
  disabled,
  required,
  className = "",
}: CustomSelectProps) {
  const [internalValue, setInternalValue] = React.useState(initialValue || "")
  const [isOpen, setIsOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const currentValue = initialValue !== undefined ? initialValue : internalValue
  const selectedOption = currentValue ? options.find((opt) => opt.value === currentValue) : undefined

  React.useEffect(() => {
    if (initialValue !== undefined) {
      setInternalValue(initialValue)
    }
  }, [initialValue])

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSelect = (val: string) => {
    setInternalValue(val)
    if (onChange) onChange(val)
    setIsOpen(false)
  }

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Hidden native input for HTML form submissions */}
      {name && <input type="hidden" name={name} value={currentValue} required={required} />}

      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-11 w-full items-center justify-between rounded-2xl border border-input bg-background px-4 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 font-medium shadow-2xs hover:bg-muted/50 transition-all text-left cursor-pointer"
      >
        <span className={selectedOption ? "text-foreground font-semibold flex items-center gap-2 min-w-0" : "text-muted-foreground flex items-center gap-2 min-w-0"}>
          {selectedOption?.icon && <span className="shrink-0">{selectedOption.icon}</span>}
          <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        </span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 max-h-72 overflow-auto rounded-2xl border border-border bg-popover text-popover-foreground p-1 shadow-xl backdrop-blur-md animate-in fade-in-80 zoom-in-95 space-y-0.5">
          {options.length === 0 ? (
            <div className="py-2 px-2.5 text-xs text-muted-foreground italic">No options available</div>
          ) : (
            options.map((option) => {
              const isSelected = option.value === currentValue
              return (
                <button
                  key={option.value}
                  type="button"
                  disabled={option.disabled}
                  onClick={() => {
                    if (!option.disabled) {
                      handleSelect(option.value)
                    }
                  }}
                  className={`flex w-full items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-all text-left cursor-pointer border ${
                    option.disabled
                      ? "opacity-50 cursor-not-allowed text-muted-foreground border-transparent"
                      : isSelected
                      ? "bg-accent/80 text-accent-foreground font-bold border-accent-foreground/20 shadow-2xs"
                      : "hover:bg-muted/80 text-foreground border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {option.icon && <div className="shrink-0">{option.icon}</div>}
                    <div className="flex flex-col min-w-0">
                      <div className="font-bold text-foreground text-xs flex items-center gap-2">
                        <span className="truncate">{option.label}</span>
                      </div>
                      {option.description && (
                        <div className="text-[10px] text-muted-foreground font-mono mt-0.5 truncate">
                          {option.description}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {option.badge}
                    {isSelected && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                  </div>
                </button>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

export const Select = CustomSelect
