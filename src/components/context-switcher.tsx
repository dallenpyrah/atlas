'use client'

import { Building2, Check, ChevronsUpDown, FolderOpen, Plus, User } from 'lucide-react'
import * as React from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Context {
  id: string
  name: string
  type: 'personal' | 'organization' | 'space'
  parent?: string
}

const contexts: Context[] = [
  { id: '1', name: 'Personal', type: 'personal' },
  { id: '2', name: 'Acme Corp', type: 'organization' },
  { id: '3', name: 'Tech Startup Inc', type: 'organization' },
  { id: '4', name: 'Design Projects', type: 'space', parent: 'Personal' },
  { id: '5', name: 'Marketing Team', type: 'space', parent: 'Acme Corp' },
  { id: '6', name: 'Development', type: 'space', parent: 'Tech Startup Inc' },
]

export function ContextSwitcher() {
  const [selectedContext, setSelectedContext] = React.useState<Context>(contexts[0])
  const [open, setOpen] = React.useState(false)

  const personalContext = contexts.filter((c) => c.type === 'personal')
  const organizations = contexts.filter((c) => c.type === 'organization')
  const spaces = contexts.filter((c) => c.type === 'space')

  const getIcon = (type: Context['type']) => {
    switch (type) {
      case 'personal':
        return <User className="h-4 w-4" />
      case 'organization':
        return <Building2 className="h-4 w-4" />
      case 'space':
        return <FolderOpen className="h-4 w-4" />
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-label="Select context"
          className="flex h-8 w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-2"
        >
          {getIcon(selectedContext.type)}
          <span className="flex-1 text-left">{selectedContext.name}</span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[200px]">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Personal</DropdownMenuLabel>
          {personalContext.map((context) => (
            <DropdownMenuItem
              key={context.id}
              onSelect={() => {
                setSelectedContext(context)
                setOpen(false)
              }}
            >
              <User className="mr-2 h-4 w-4" />
              <span>{context.name}</span>
              {selectedContext.id === context.id && <Check className="ml-auto h-4 w-4" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuLabel>Organizations</DropdownMenuLabel>
          {organizations.map((context) => (
            <DropdownMenuItem
              key={context.id}
              onSelect={() => {
                setSelectedContext(context)
                setOpen(false)
              }}
            >
              <Building2 className="mr-2 h-4 w-4" />
              <span>{context.name}</span>
              {selectedContext.id === context.id && <Check className="ml-auto h-4 w-4" />}
            </DropdownMenuItem>
          ))}
          <DropdownMenuItem>
            <Plus className="mr-2 h-4 w-4" />
            <span>Create Organization</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuLabel>Spaces</DropdownMenuLabel>
          {spaces.map((context) => (
            <DropdownMenuItem
              key={context.id}
              onSelect={() => {
                setSelectedContext(context)
                setOpen(false)
              }}
            >
              <FolderOpen className="mr-2 h-4 w-4" />
              <div className="flex flex-col">
                <span>{context.name}</span>
                <span className="text-xs text-muted-foreground">{context.parent}</span>
              </div>
              {selectedContext.id === context.id && <Check className="ml-auto h-4 w-4" />}
            </DropdownMenuItem>
          ))}
          <DropdownMenuItem>
            <Plus className="mr-2 h-4 w-4" />
            <span>Create Space</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
