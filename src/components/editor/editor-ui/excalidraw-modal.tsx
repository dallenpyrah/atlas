type AppState = any
type BinaryFiles = any
type ExcalidrawImperativeAPI = any
type ExcalidrawInitialDataState = any

import { DialogTrigger } from '@radix-ui/react-dialog'
import dynamic from 'next/dynamic'
import * as React from 'react'
import { type JSX, type ReactElement, useEffect, useLayoutEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent } from '@/components/ui/dialog'

const Excalidraw = dynamic(() => import('@/components/editor/editor-ui/excalidraw'), { ssr: false })

export type ExcalidrawInitialElements = ExcalidrawInitialDataState['elements']

type Props = {
  closeOnClickOutside?: boolean
  initialElements: ExcalidrawInitialElements
  initialAppState: AppState
  initialFiles: BinaryFiles
  isShown?: boolean
  onClose: () => void
  onDelete: () => void
  onSave: (
    elements: ExcalidrawInitialElements,
    appState: Partial<AppState>,
    files: BinaryFiles,
  ) => void
}

export const useCallbackRefState = () => {
  const [refValue, setRefValue] = React.useState<ExcalidrawImperativeAPI | null>(null)
  const refCallback = React.useCallback(
    (value: ExcalidrawImperativeAPI | null) => setRefValue(value),
    [],
  )
  return [refValue, refCallback] as const
}

export function ExcalidrawModal({
  closeOnClickOutside = false,
  onSave,
  initialElements,
  initialAppState,
  initialFiles,
  isShown = false,
  onDelete,
  onClose,
}: Props): ReactElement | null {
  const excaliDrawModelRef = useRef<HTMLDivElement | null>(null)
  const [excalidrawAPI, excalidrawAPIRefCallback] = useCallbackRefState()
  const [discardModalOpen, setDiscardModalOpen] = useState(false)
  const [elements, setElements] = useState<ExcalidrawInitialElements>(initialElements)
  const [files, setFiles] = useState<BinaryFiles>(initialFiles)

  useEffect(() => {
    if (excaliDrawModelRef.current !== null) {
      excaliDrawModelRef.current.focus()
    }
  }, [])

  useEffect(() => {
    let modalOverlayElement: HTMLElement | null = null

    const clickOutsideHandler = (event: MouseEvent) => {
      const target = event.target
      if (
        excaliDrawModelRef.current !== null &&
        !excaliDrawModelRef.current.contains(target as Node) &&
        closeOnClickOutside
      ) {
        onDelete()
      }
    }

    if (excaliDrawModelRef.current !== null) {
      modalOverlayElement = excaliDrawModelRef.current?.parentElement
      if (modalOverlayElement !== null) {
        modalOverlayElement?.addEventListener('click', clickOutsideHandler)
      }
    }

    return () => {
      if (modalOverlayElement !== null) {
        modalOverlayElement?.removeEventListener('click', clickOutsideHandler)
      }
    }
  }, [closeOnClickOutside, onDelete])

  useLayoutEffect(() => {
    const currentModalRef = excaliDrawModelRef.current

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onDelete()
      }
    }

    if (currentModalRef !== null) {
      currentModalRef.addEventListener('keydown', onKeyDown)
    }

    return () => {
      if (currentModalRef !== null) {
        currentModalRef.removeEventListener('keydown', onKeyDown)
      }
    }
  }, [elements, files, onDelete])

  const save = () => {
    if (elements && elements.filter((el: any) => !el.isDeleted).length > 0) {
      const appState = excalidrawAPI?.getAppState()
      const partialState: Partial<AppState> = {
        exportBackground: appState?.exportBackground,
        exportScale: appState?.exportScale,
        exportWithDarkMode: appState?.theme === 'dark',
        isBindingEnabled: appState?.isBindingEnabled,
        isLoading: appState?.isLoading,
        name: appState?.name,
        theme: appState?.theme,
        viewBackgroundColor: appState?.viewBackgroundColor,
        viewModeEnabled: appState?.viewModeEnabled,
        zenModeEnabled: appState?.zenModeEnabled,
        zoom: appState?.zoom,
      }
      onSave(elements, partialState, files)
    } else {
      onDelete()
    }
  }

  function ShowDiscardDialog(): JSX.Element {
    return (
      <Dialog open={discardModalOpen} onOpenChange={setDiscardModalOpen}>
        <DialogContent>Are you sure you want to discard the changes?</DialogContent>
        <DialogClose asChild>
          <Button
            onClick={() => {
              setDiscardModalOpen(false)
              onClose()
            }}
          >
            Discard
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button onClick={() => setDiscardModalOpen(false)}>Cancel</Button>
        </DialogClose>
      </Dialog>
    )
  }

  if (isShown === false) {
    return null
  }

  const onChange = (els: ExcalidrawInitialElements, _: AppState, fls: BinaryFiles) => {
    setElements(els)
    setFiles(fls)
  }

  return (
    <Dialog open={isShown}>
      <DialogTrigger />
      <DialogContent className="h-4/6 max-w-4xl overflow-hidden p-0">
        <div className="relative" role="dialog">
          <div className="h-full w-full" ref={excaliDrawModelRef} tabIndex={-1}>
            <div className="h-full w-full">
              {discardModalOpen && <ShowDiscardDialog />}
              <Excalidraw
                onChange={onChange}
                excalidrawAPI={excalidrawAPIRefCallback}
                initialData={{
                  appState: initialAppState || { isLoading: false },
                  elements: initialElements,
                  files: initialFiles,
                }}
              />
              <div className="flex h-full items-center justify-center">Loading...</div>
              <div className="absolute right-1/2 bottom-0 bottom-5 z-10 flex translate-x-1/2 gap-2">
                <Button variant="outline" onClick={onClose}>
                  Discard
                </Button>
                <Button onClick={save}>Save</Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
