'use client'

import { Image } from 'lucide-react'
import React from 'react'
import { createPortal } from 'react-dom'

import { Button, type ButtonProps } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useImageUpload } from '@/hooks/use-image-upload'
import { cn } from '@/lib/utils'
import { useToolbar } from './toolbar-provider'

const ImagePlaceholderToolbar = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, onClick, children, ...props }, ref) => {
    const { editor } = useToolbar()
    const { fileInputRef, handleFileChange } = useImageUpload({
      onUpload: (imageUrl) => {
        editor
          ?.chain()
          .focus()
          .setImage({
            src: imageUrl,
            alt: fileInputRef.current?.files?.[0]?.name,
          })
          .run()
      },
    })
    return (
      <>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              type="button"
              className={cn(
                'h-8 w-8 p-0 sm:h-9 sm:w-9',
                editor?.isActive('image-placeholder') && 'bg-accent',
                className,
              )}
              onClick={(e) => {
                // Open native file picker instead of inserting placeholder
                const input = fileInputRef.current
                if (input) {
                  if (typeof (input as any).showPicker === 'function') {
                    try {
                      ;(input as any).showPicker()
                    } catch {
                      input.click()
                    }
                  } else {
                    input.click()
                  }
                }
                onClick?.(e)
              }}
              ref={ref}
              {...props}
            >
              {children ?? <Image className="h-4 w-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <span>Image</span>
          </TooltipContent>
        </Tooltip>
        {typeof document !== 'undefined'
          ? createPortal(
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{
                  position: 'fixed',
                  top: -10000,
                  left: -10000,
                  width: 1,
                  height: 1,
                  opacity: 0,
                }}
                tabIndex={-1}
              />,
              document.body,
            )
          : null}
      </>
    )
  },
)

ImagePlaceholderToolbar.displayName = 'ImagePlaceholderToolbar'

export { ImagePlaceholderToolbar }
