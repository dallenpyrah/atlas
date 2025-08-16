import type {
  EditorConfig,
  EditorThemeClassName,
  LexicalEditor,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from 'lexical'
import { DecoratorNode } from 'lexical'
import type { JSX } from 'react'
import * as React from 'react'

import { useSharedAutocompleteContext } from '@/components/editor/context/shared-autocomplete-context'
import { uuid as UUID } from '@/components/editor/plugins/autocomplete-plugin'

declare global {
  interface Navigator {
    userAgentData?: {
      mobile: boolean
    }
  }
}

export type SerializedAutocompleteNode = Spread<
  {
    uuid: string
  },
  SerializedLexicalNode
>

export class AutocompleteNode extends DecoratorNode<JSX.Element | null> {
  __uuid: string

  static clone(node: AutocompleteNode): AutocompleteNode {
    return new AutocompleteNode(node.__uuid, node.__key)
  }

  static getType(): 'autocomplete' {
    return 'autocomplete'
  }

  static importJSON(serializedNode: SerializedAutocompleteNode): AutocompleteNode {
    const node = $createAutocompleteNode(serializedNode.uuid)
    return node
  }

  exportJSON(): SerializedAutocompleteNode {
    return {
      ...super.exportJSON(),
      type: 'autocomplete',
      uuid: this.__uuid,
      version: 1,
    }
  }

  constructor(uuid: string, key?: NodeKey) {
    super(key)
    this.__uuid = uuid
  }

  updateDOM(_prevNode: unknown, _dom: HTMLElement, _config: EditorConfig): boolean {
    return false
  }

  createDOM(_config: EditorConfig): HTMLElement {
    return document.createElement('span')
  }

  decorate(_editor: LexicalEditor, config: EditorConfig): JSX.Element | null {
    if (this.__uuid !== UUID) {
      return null
    }
    return <AutocompleteComponent className={config.theme.autocomplete} />
  }
}

export function $createAutocompleteNode(uuid: string): AutocompleteNode {
  return new AutocompleteNode(uuid)
}

function AutocompleteComponent({ className }: { className: EditorThemeClassName }): JSX.Element {
  const [suggestion] = useSharedAutocompleteContext()
  const userAgentData = window.navigator.userAgentData
  const isMobile =
    userAgentData !== undefined
      ? userAgentData.mobile
      : window.innerWidth <= 800 && window.innerHeight <= 600
  return (
    <span className={className} spellCheck="false">
      {suggestion} {isMobile ? '(SWIPE \u2B95)' : '(TAB)'}
    </span>
  )
}
