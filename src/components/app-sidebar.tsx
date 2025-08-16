'use client'

import {
  ChevronRight,
  Edit2,
  FileText,
  Folder,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Search,
} from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import * as React from 'react'
import type { FileRecord } from '@/app/api/files/utils'
import { ChatHistoryItem } from '@/components/chat-history-item'
import { CommandChatItem } from '@/components/command-chat-item'
import { CommandNoteItem } from '@/components/command-note-item'
import { ContextSwitcher } from '@/components/context-switcher'
import { FilePreviewDialog } from '@/components/file-preview-dialog'
import { FileTree } from '@/components/file-tree'
import { NavUser } from '@/components/nav-user'
import { NoteHistoryItem } from '@/components/note-history-item'
import { OysterBadge } from '@/components/oyster-badge'
import { useAppContext } from '@/components/providers/context-provider'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
} from '@/components/ui/command'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
} from '@/components/ui/sidebar'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useKeepPrevious } from '@/hooks/use-keep-previous'
import { queryKeys } from '@/lib/query-keys'
import { useDeleteChatMutation } from '@/mutations/chat'
import { useCreateNoteMutation, useDeleteNoteMutation } from '@/mutations/note'
import { chatService } from '@/services/chat'
import { noteService } from '@/services/note'

function TrashIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  )
}

function useHistoryItems() {
  const { context } = useAppContext()
  const spaceId = context?.type === 'space' ? context.id : null
  const organizationId = context?.type === 'organization' ? context.id : null
  const { data: chats } = useKeepPrevious({
    queryKey: queryKeys.chats.list({ recent: true, limit: 5, spaceId, organizationId }),
    queryFn: () =>
      chatService.listChats({
        spaceId,
        organizationId,
        limit: 5,
        sortBy: 'updatedAt',
        sortOrder: 'desc',
      }),
  })
  return (chats ?? []).map((c) => ({ id: c.id, title: c.title ?? 'Untitled' }))
}

function useNotesHistoryItems() {
  const { context } = useAppContext()
  const spaceId = context?.type === 'space' ? context.id : null
  const organizationId = context?.type === 'organization' ? context.id : null
  const { data: notes } = useKeepPrevious({
    queryKey: queryKeys.notes.list({ recent: true, limit: 5, spaceId, organizationId }),
    queryFn: () =>
      noteService.listNotes({
        spaceId,
        organizationId,
        limit: 5,
        sortBy: 'updatedAt',
        sortOrder: 'desc',
      }),
  })
  return (notes ?? []).map((n) => ({ id: n.id, title: n.title ?? 'Untitled' }))
}

function ChatActionsMenu({
  chatId,
  className,
  isInCommandItem,
  onEditClick,
}: {
  chatId: string
  className?: string
  isInCommandItem?: boolean
  onEditClick?: () => void
}) {
  const { mutateAsync, isPending } = useDeleteChatMutation()
  const router = useRouter()
  const pathname = usePathname()

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open chat actions"
              title="More actions"
              className={`group size-7 p-0 text-muted-foreground hover:text-foreground rounded-sm ${className ?? ''}`}
              onMouseDown={(e) => {
                if (isInCommandItem) {
                  e.preventDefault()
                }
              }}
              onClick={(e) => {
                e.stopPropagation()
              }}
            >
              <MoreHorizontal className="size-4 transition-colors group-hover:text-foreground" />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="end">
          Actions
        </TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end" side={isInCommandItem ? 'right' : 'right'} className="w-40">
        <DropdownMenuLabel className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
          Actions
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault()
          }}
          onClick={(e) => {
            e.stopPropagation()
            onEditClick?.()
          }}
        >
          <Edit2 className="size-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          onSelect={async () => {
            try {
              await mutateAsync({ chatId })
              if (pathname === `/chat/${chatId}`) {
                router.replace('/chat', { scroll: false })
              }
            } catch (_) {}
          }}
          disabled={isPending}
        >
          <TrashIcon className="size-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function NoteActionsMenu({
  noteId,
  className,
  isInCommandItem,
  onEditClick,
  availableNotes,
}: {
  noteId: string
  className?: string
  isInCommandItem?: boolean
  onEditClick?: () => void
  availableNotes?: { id: string; title: string }[]
}) {
  const { mutateAsync, isPending } = useDeleteNoteMutation()
  const router = useRouter()
  const pathname = usePathname()

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open note actions"
              title="More actions"
              className={`group size-7 p-0 text-muted-foreground hover:text-foreground rounded-sm ${className ?? ''}`}
              onMouseDown={(e) => {
                if (isInCommandItem) {
                  e.preventDefault()
                }
              }}
              onClick={(e) => {
                e.stopPropagation()
              }}
            >
              <MoreHorizontal className="size-4 transition-colors group-hover:text-foreground" />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="end">
          Actions
        </TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end" side={isInCommandItem ? 'right' : 'right'} className="w-40">
        <DropdownMenuLabel className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
          Actions
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault()
          }}
          onClick={(e) => {
            e.stopPropagation()
            onEditClick?.()
          }}
        >
          <Edit2 className="size-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          onSelect={async () => {
            try {
              await mutateAsync({ noteId })
              if (pathname === `/notes/${noteId}`) {
                const remainingNotes = availableNotes?.filter((note) => note.id !== noteId) || []
                if (remainingNotes.length > 0) {
                  router.replace(`/notes/${remainingNotes[0].id}`, { scroll: false })
                } else {
                  router.replace('/notes', { scroll: false })
                }
              }
            } catch (_) {}
          }}
          disabled={isPending}
        >
          <TrashIcon className="size-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const historyItems = useHistoryItems()
  const notesHistoryItems = useNotesHistoryItems()
  const router = useRouter()
  const { context } = useAppContext()
  const { mutateAsync: createNote } = useCreateNoteMutation()

  const [isSearchOpen, setIsSearchOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false)
  const [previewFile, setPreviewFile] = React.useState<FileRecord | null>(null)

  const openPreviewForFile = React.useCallback((file: FileRecord) => {
    setPreviewFile(file)
    setIsPreviewOpen(true)
  }, [])

  const selectedSpaceId: string | null = context?.type === 'space' ? context.id : null
  const selectedOrgId: string | null = context?.type === 'organization' ? context.id : null

  const { data: searchResults } = useKeepPrevious({
    queryKey: queryKeys.chats.list({
      spaceId: selectedSpaceId,
      organizationId: selectedOrgId,
      search: search || undefined,
      limit: 20,
    }),
    queryFn: () =>
      chatService.listChats({
        spaceId: selectedSpaceId,
        organizationId: selectedOrgId,
        search: search || undefined,
        limit: 20,
        sortBy: 'updatedAt',
        sortOrder: 'desc',
      }),
    enabled: isSearchOpen,
  })

  const { data: noteSearchResults } = useKeepPrevious({
    queryKey: queryKeys.notes.list({
      spaceId: selectedSpaceId,
      organizationId: selectedOrgId,
      search: search || undefined,
      limit: 20,
    }),
    queryFn: () =>
      noteService.listNotes({
        spaceId: selectedSpaceId,
        organizationId: selectedOrgId,
        search: search || undefined,
        limit: 20,
        sortBy: 'updatedAt',
        sortOrder: 'desc',
      }),
    enabled: isSearchOpen,
  })

  async function handleNewChatClick() {
    try {
      router.push(`/chat`, { scroll: false })
    } catch (e) {}
  }

  async function handleNewNoteClick() {
    try {
      const newNote = await createNote({
        title: 'Untitled',
        spaceId: selectedSpaceId,
        organizationId: selectedOrgId,
      })
      router.push(`/notes/${newNote.id}`, { scroll: false })
    } catch (e) {}
  }

  return (
    <>
      <Sidebar variant="inset" {...props}>
        <SidebarHeader className="my-1">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <OysterBadge />
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent className="my-1">
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <ContextSwitcher />
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Button
                    variant="ghost"
                    type="button"
                    className="justify-start"
                    onClick={handleNewChatClick}
                  >
                    <Plus className="size-4" />
                    <span>New Chat</span>
                  </Button>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Button
                    variant="ghost"
                    type="button"
                    className="justify-start"
                    onClick={() => setIsSearchOpen(true)}
                  >
                    <Search className="size-4" />
                    <span>Search</span>
                  </Button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarMenu>
              <Collapsible defaultOpen={false} asChild>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="History">
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" type="button" className="justify-start">
                        <MessageSquare className="size-4" />
                        <span>History</span>
                      </Button>
                    </CollapsibleTrigger>
                  </SidebarMenuButton>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuAction className="data-[state=open]:rotate-90">
                      <ChevronRight />
                      <span className="sr-only">Toggle</span>
                    </SidebarMenuAction>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {historyItems.map((chat) => (
                        <ChatHistoryItem
                          key={chat.id}
                          chat={chat}
                          ChatActionsMenu={ChatActionsMenu}
                        />
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
              <Collapsible defaultOpen={false} asChild>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Notes">
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" type="button" className="justify-start">
                        <FileText className="size-4" />
                        <span>Notes</span>
                      </Button>
                    </CollapsibleTrigger>
                  </SidebarMenuButton>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuAction className="data-[state=open]:rotate-90">
                      <ChevronRight />
                      <span className="sr-only">Toggle</span>
                    </SidebarMenuAction>
                  </CollapsibleTrigger>
                  <SidebarMenuAction className="right-6" asChild>
                    <span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 p-0"
                            onClick={handleNewNoteClick}
                            aria-label="New note"
                          >
                            <Plus className="size-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" align="end">
                          New note
                        </TooltipContent>
                      </Tooltip>
                    </span>
                  </SidebarMenuAction>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {notesHistoryItems.map((note) => (
                        <NoteHistoryItem
                          key={note.id}
                          note={note}
                          NoteActionsMenu={(props) => (
                            <NoteActionsMenu {...props} availableNotes={notesHistoryItems} />
                          )}
                        />
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
              <Collapsible defaultOpen={false} asChild>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Files">
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" type="button" className="justify-start">
                        <Folder className="size-4" />
                        <span>Files</span>
                      </Button>
                    </CollapsibleTrigger>
                  </SidebarMenuButton>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuAction className="data-[state=open]:rotate-90">
                      <ChevronRight />
                      <span className="sr-only">Toggle</span>
                    </SidebarMenuAction>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="pl-2">
                      <FileTree onFileClick={openPreviewForFile} />
                    </div>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <NavUser />
        </SidebarFooter>
      </Sidebar>
      <FilePreviewDialog
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        file={previewFile ?? undefined}
      />
      <CommandDialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <CommandInput
          placeholder="Search chats and notes..."
          value={search}
          onValueChange={setSearch}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading={search ? 'Chats' : 'Recent Chats'}>
            {(searchResults ?? []).map((chat) => (
              <CommandChatItem
                key={chat.id}
                chat={{ id: chat.id, title: chat.title }}
                onClose={() => setIsSearchOpen(false)}
                ChatActionsMenu={ChatActionsMenu}
              />
            ))}
          </CommandGroup>
          <CommandGroup heading={search ? 'Notes' : 'Recent Notes'}>
            {(noteSearchResults ?? []).map((note) => (
              <CommandNoteItem
                key={note.id}
                note={{ id: note.id, title: note.title }}
                onClose={() => setIsSearchOpen(false)}
                NoteActionsMenu={(props) => (
                  <NoteActionsMenu
                    {...props}
                    availableNotes={noteSearchResults?.map((n) => ({ id: n.id, title: n.title }))}
                  />
                )}
              />
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
