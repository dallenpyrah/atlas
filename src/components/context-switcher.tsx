'use client'

import { Building2, Check, ChevronsUpDown, FolderOpen, Loader2, Plus, User } from 'lucide-react'
import * as React from 'react'
import { toast } from 'sonner'
import { useSession } from '@/clients/auth'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  useCreateOrganizationMutation,
  useSetActiveOrganizationMutation,
} from '@/mutations/organization'
import { useCreateSpaceMutation } from '@/mutations/space'
import { useActiveOrganization, useOrganizations } from '@/queries/organizations'
import { useSpaces } from '@/queries/spaces'

interface Context {
  id: string
  name: string
  type: 'personal' | 'organization' | 'space'
  parent?: string
  organizationId?: string | null
}

export function ContextSwitcher() {
  const [open, setOpen] = React.useState(false)
  const [createOrgOpen, setCreateOrgOpen] = React.useState(false)
  const [createSpaceOpen, setCreateSpaceOpen] = React.useState(false)
  const [selectedContext, setSelectedContext] = React.useState<Context | null>(null)

  const { data: session } = useSession()
  const { data: organizations = [], isLoading: orgsLoading } = useOrganizations()
  const { data: activeOrganization } = useActiveOrganization()
  const { data: spaces = [], isLoading: spacesLoading } = useSpaces()
  const setActiveOrganization = useSetActiveOrganizationMutation()
  const createOrganization = useCreateOrganizationMutation()
  const createSpace = useCreateSpaceMutation()

  const [orgForm, setOrgForm] = React.useState({ name: '', slug: '' })
  const [spaceForm, setSpaceForm] = React.useState({
    name: '',
    slug: '',
    description: '',
    isPrivate: true,
    organizationId: null as string | null,
  })

  const isLoading = orgsLoading || spacesLoading

  const personalContext = session?.user
    ? [
        {
          id: 'personal',
          name: 'Personal',
          type: 'personal' as const,
        },
      ]
    : []

  const organizationContexts = organizations.map((org) => ({
    id: org.id,
    name: org.name,
    type: 'organization' as const,
  }))

  const spaceContexts = spaces.map((space) => ({
    id: space.id,
    name: space.name,
    type: 'space' as const,
    parent: space.organizationId
      ? organizations.find((org) => org.id === space.organizationId)?.name
      : 'Personal',
    organizationId: space.organizationId,
  }))

  React.useEffect(() => {
    if (!selectedContext && session?.user) {
      if (activeOrganization) {
        setSelectedContext({
          id: activeOrganization.id,
          name: activeOrganization.name,
          type: 'organization',
        })
      } else {
        setSelectedContext({
          id: 'personal',
          name: 'Personal',
          type: 'personal',
        })
      }
    }
  }, [activeOrganization, selectedContext, session])

  const getIcon = (type: Context['type']) => {
    switch (type) {
      case 'personal':
        return <User className="ml-1 h-4 w-4" />
      case 'organization':
        return <Building2 className="ml-1 h-4 w-4" />
      case 'space':
        return <FolderOpen className="ml-1 h-4 w-4" />
    }
  }

  const handleContextSelect = async (context: Context) => {
    setSelectedContext(context)
    setOpen(false)

    if (context.type === 'organization') {
      await setActiveOrganization.mutateAsync({ organizationId: context.id })
    } else if (context.type === 'personal') {
      await setActiveOrganization.mutateAsync({ organizationId: null })
    }
  }

  const handleCreateOrganization = async () => {
    if (!orgForm.name || !orgForm.slug) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const result = await createOrganization.mutateAsync(orgForm)
      setCreateOrgOpen(false)
      setOrgForm({ name: '', slug: '' })
      await setActiveOrganization.mutateAsync({ organizationId: result.id })
    } catch (_error) {}
  }

  const handleCreateSpace = async () => {
    if (!spaceForm.name || !spaceForm.slug) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      await createSpace.mutateAsync(spaceForm)
      setCreateSpaceOpen(false)
      setSpaceForm({ name: '', slug: '', description: '', isPrivate: true, organizationId: null })
    } catch (_error) {}
  }

  if (isLoading || !selectedContext) {
    return (
      <button
        type="button"
        className="flex h-8 w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-2"
        disabled
      >
        <Loader2 className="ml-1 h-4 w-4 animate-spin" />
        <span className="flex-1 text-left">Loading...</span>
      </button>
    )
  }

  return (
    <>
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
              <DropdownMenuItem key={context.id} onSelect={() => handleContextSelect(context)}>
                <User className="mr-2 h-4 w-4" />
                <span>{context.name}</span>
                {selectedContext.id === context.id && <Check className="ml-auto h-4 w-4" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuLabel>Organizations</DropdownMenuLabel>
            {organizationContexts.map((context) => (
              <DropdownMenuItem key={context.id} onSelect={() => handleContextSelect(context)}>
                <Building2 className="mr-2 h-4 w-4" />
                <span>{context.name}</span>
                {selectedContext.id === context.id && <Check className="ml-auto h-4 w-4" />}
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem
              onSelect={() => {
                setOpen(false)
                setCreateOrgOpen(true)
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              <span>Create Organization</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuLabel>Spaces</DropdownMenuLabel>
            {spaceContexts.map((context) => (
              <DropdownMenuItem key={context.id} onSelect={() => handleContextSelect(context)}>
                <FolderOpen className="mr-2 h-4 w-4" />
                <div className="flex flex-col">
                  <span>{context.name}</span>
                  <span className="text-xs text-muted-foreground">{context.parent}</span>
                </div>
                {selectedContext.id === context.id && <Check className="ml-auto h-4 w-4" />}
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem
              onSelect={() => {
                setOpen(false)
                setCreateSpaceOpen(true)
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              <span>Create Space</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={createOrgOpen} onOpenChange={setCreateOrgOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Organization</DialogTitle>
            <DialogDescription>
              Create a new organization to collaborate with your team.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="org-name">Name</Label>
              <Input
                id="org-name"
                value={orgForm.name}
                onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
                placeholder="Acme Corporation"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="org-slug">Slug</Label>
              <Input
                id="org-slug"
                value={orgForm.slug}
                onChange={(e) => setOrgForm({ ...orgForm, slug: e.target.value })}
                placeholder="acme-corp"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOrgOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateOrganization} disabled={createOrganization.isPending}>
              {createOrganization.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Organization'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={createSpaceOpen} onOpenChange={setCreateSpaceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Space</DialogTitle>
            <DialogDescription>Create a new space to organize your work.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="space-name">Name</Label>
              <Input
                id="space-name"
                value={spaceForm.name}
                onChange={(e) => setSpaceForm({ ...spaceForm, name: e.target.value })}
                placeholder="Marketing Projects"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="space-slug">Slug</Label>
              <Input
                id="space-slug"
                value={spaceForm.slug}
                onChange={(e) => setSpaceForm({ ...spaceForm, slug: e.target.value })}
                placeholder="marketing-projects"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="space-description">Description (optional)</Label>
              <Textarea
                id="space-description"
                value={spaceForm.description}
                onChange={(e) => setSpaceForm({ ...spaceForm, description: e.target.value })}
                placeholder="A space for all marketing related projects and campaigns"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="space-org">Organization (optional)</Label>
              <Select
                value={spaceForm.organizationId ?? undefined}
                onValueChange={(value) =>
                  setSpaceForm({
                    ...spaceForm,
                    organizationId: value || null,
                  })
                }
              >
                <SelectTrigger id="space-org">
                  <SelectValue placeholder="Select organization (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="space-private"
                checked={spaceForm.isPrivate}
                onCheckedChange={(checked) => setSpaceForm({ ...spaceForm, isPrivate: checked })}
              />
              <Label htmlFor="space-private">Private space</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateSpaceOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSpace} disabled={createSpace.isPending}>
              {createSpace.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Space'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
