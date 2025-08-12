'use client'

import { Anthropic, Google, OpenAI, XAI } from '@lobehub/icons'
import { Brain } from 'lucide-react'
import { memo } from 'react'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  getCapabilityLabel,
  getModelById,
  type Model,
  type ModelCapability,
  modelGroups,
} from '@/lib/ai/models'
import { cn } from '@/lib/utils'

interface ModelSelectorProps {
  value?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  className?: string
  size?: 'sm' | 'default'
}

function ModelBadge({ capability }: { capability: ModelCapability }) {
  return (
    <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">
      {getCapabilityLabel(capability)}
    </Badge>
  )
}

function getProviderIcon(provider: string): React.ComponentType<{ className?: string }> {
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    openai: OpenAI,
    anthropic: Anthropic,
    google: Google,
    xai: XAI,
  }
  return iconMap[provider] || Brain
}

function ModelDisplay({ model }: { model: Model }) {
  const Icon = getProviderIcon(model.provider)
  return (
    <div className="flex items-center gap-1.5">
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate">{model.name}</span>
    </div>
  )
}

function ModelOption({ model }: { model: Model }) {
  const Icon = getProviderIcon(model.provider)

  return (
    <div className="flex items-center gap-2 w-full">
      <Icon className="h-4 w-4 shrink-0" />
      <span className="flex-1 truncate">{model.name}</span>
      <div className="flex items-center gap-1">
        {model.capabilities.map((capability) => (
          <ModelBadge key={capability} capability={capability} />
        ))}
      </div>
    </div>
  )
}

export const ModelSelector = memo(function ModelSelector({
  value,
  onValueChange,
  disabled = false,
  className,
  size = 'default',
}: ModelSelectorProps) {
  const selectedModel = value ? getModelById(value) : undefined

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={cn('', className)} size={size}>
        <SelectValue placeholder="Select a model">
          {selectedModel && <ModelDisplay model={selectedModel} />}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="w-[280px] sm:w-[320px]">
        {modelGroups.map((group, index) => (
          <div key={group.provider}>
            {index > 0 && <SelectSeparator />}
            <SelectGroup>
              <SelectLabel className="font-semibold">{group.label}</SelectLabel>
              {group.models.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  <ModelOption model={model} />
                </SelectItem>
              ))}
            </SelectGroup>
          </div>
        ))}
      </SelectContent>
    </Select>
  )
})
