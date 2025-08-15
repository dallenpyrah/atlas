'use client'
import './tiptap.css'
import { Color } from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import Typography from '@tiptap/extension-typography'
import Underline from '@tiptap/extension-underline'
import { EditorContent, type Extension, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { TipTapFloatingMenu } from '@/components/tiptap/extensions/floating-menu'
import { FloatingToolbar } from '@/components/tiptap/extensions/floating-toolbar'
import { ImageExtension } from '@/components/tiptap/extensions/image'
import { ImagePlaceholder } from '@/components/tiptap/extensions/image-placeholder'
import SearchAndReplace from '@/components/tiptap/extensions/search-and-replace'
import { cn } from '@/lib/utils'
import { EditorToolbar } from './toolbars/editor-toolbar'

// Start with empty content for new editor instances
const initialContent = ''

const extensions = [
  StarterKit.configure({
    orderedList: {
      HTMLAttributes: {
        class: 'list-decimal',
      },
    },
    bulletList: {
      HTMLAttributes: {
        class: 'list-disc',
      },
    },
    heading: {
      levels: [1, 2, 3, 4],
    },
  }),
  Placeholder.configure({
    emptyNodeClass: 'is-editor-empty',
    placeholder: ({ node }) => {
      switch (node.type.name) {
        case 'heading':
          return `Heading ${node.attrs.level}`
        case 'detailsSummary':
          return 'Section title'
        case 'codeBlock':
          // never show the placeholder when editing code
          return ''
        default:
          return "Write, type '/' for commands"
      }
    },
    includeChildren: false,
  }),
  TextAlign.configure({
    types: ['heading', 'paragraph'],
  }),
  TextStyle,
  Subscript,
  Superscript,
  Underline,
  Link,
  Color,
  Highlight.configure({
    multicolor: true,
  }),
  ImageExtension,
  ImagePlaceholder,
  SearchAndReplace,
  Typography,
]

type RichTextEditorProps = {
  className?: string
  initialContent?: string
  onChange?: (html: string) => void
}

export function RichTextEditorDemo({
  className,
  initialContent = '',
  onChange,
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: extensions as Extension[],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'max-w-full focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML())
    },
  })

  if (!editor) return null

  return (
    <div
      className={cn(
        'relative w-full h-[calc(100svh-4rem)] max-h-[calc(100svh-4rem)] flex flex-col rounded-md bg-background',
        className,
      )}
    >
      <div className="sticky top-0 z-10 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/75">
        <EditorToolbar editor={editor} />
      </div>
      <div className="flex-1 overflow-y-auto">
        <FloatingToolbar editor={editor} />
        <TipTapFloatingMenu editor={editor} />
        <EditorContent
          editor={editor}
          className="min-h-[600px] w-full min-w-full cursor-text pb-6 px-3 sm:px-5"
        />
      </div>
    </div>
  )
}
