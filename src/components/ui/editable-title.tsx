'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface EditableTitleProps {
  title: string
  onSave: (newTitle: string) => Promise<void>
  isEditing: boolean
  onEditingChange: (editing: boolean) => void
  className?: string
  inputClassName?: string
}

export function EditableTitle({
  title,
  onSave,
  isEditing,
  onEditingChange,
  className,
  inputClassName,
}: EditableTitleProps) {
  const [value, setValue] = useState(title)
  const [isSaving, setIsSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const spanRef = useRef<HTMLSpanElement>(null)
  const [textWidth, setTextWidth] = useState(0)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  useEffect(() => {
    setValue(title)
  }, [title])

  useEffect(() => {
    if (spanRef.current) {
      setTextWidth(spanRef.current.offsetWidth)
    }
  }, [value])

  const handleSave = async () => {
    if (isSaving) return

    const trimmedValue = value.trim()
    if (!trimmedValue || trimmedValue === title) {
      setValue(title)
      onEditingChange(false)
      return
    }

    setIsSaving(true)
    try {
      await onSave(trimmedValue)
      onEditingChange(false)
    } catch (error) {
      console.error('Failed to save title:', error)
      setValue(title)
    } finally {
      setIsSaving(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      void handleSave()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setValue(title)
      onEditingChange(false)
    }
  }

  const handleBlur = () => {
    void handleSave()
  }

  if (!isEditing) {
    return (
      <span
        className={cn('truncate cursor-pointer', className)}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onEditingChange(true)
        }}
      >
        {title}
      </span>
    )
  }

  return (
    <div
      className={cn('relative inline-flex items-center', className)}
      onClick={(e) => e.stopPropagation()}
    >
      <span ref={spanRef} className="invisible absolute whitespace-pre" style={{ font: 'inherit' }}>
        {value || ' '}
      </span>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        disabled={isSaving}
        style={{ width: `${textWidth + 20}px` }}
        className={cn(
          'bg-transparent border-none outline-none text-current',
          'placeholder:text-muted-foreground',
          inputClassName,
        )}
      />
    </div>
  )
}
