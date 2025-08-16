'use client'

import { useChat } from '@ai-sdk/react'
import type { UIDataTypes, UIMessage, UIMessagePart, UITools } from 'ai'
import { AlertTriangle, ArrowUp, Copy } from 'lucide-react'
import { memo, useCallback, useRef, useState } from 'react'
import { ModelSelector } from '@/components/chat/model-selector'
import { useAppContext } from '@/components/providers/context-provider'
import { Button } from '@/components/ui/button'
import { ChatContainerContent, ChatContainerRoot } from '@/components/ui/chat-container'
import { Loader } from '@/components/ui/loader'
import { Message, MessageAction, MessageActions, MessageContent } from '@/components/ui/message'
import { PromptInput, PromptInputActions, PromptInputTextarea } from '@/components/ui/prompt-input'
import { Reasoning, ReasoningContent, ReasoningTrigger } from '@/components/ui/reasoning'
import { ScrollButton } from '@/components/ui/scroll-button'
import { Tool, type ToolPart } from '@/components/ui/tool'
import { useKeepPrevious } from '@/hooks/use-keep-previous'
import { queryKeys } from '@/lib/query-keys'
import { cn } from '@/lib/utils'
import { useCreateChatMutation, useUpdateChatMutation } from '@/mutations/chat'
import { chatService } from '@/services/chat'

type MessageComponentProps = {
  message: UIMessage
  isLastMessage: boolean
  isStreaming: boolean
}

function getMessageText(message: UIMessage): string {
  return (
    message?.parts
      ?.filter((part: UIMessagePart<UIDataTypes, UITools>) => part.type === 'text')
      .map((part: UIMessagePart<UIDataTypes, UITools> & { text: string }) => part.text)
      .join('') ?? ''
  )
}

type ToolMessagePart = UIMessagePart<UIDataTypes, UITools> & {
  state: 'input-streaming' | 'input-available' | 'output-available' | 'output-error'
  input?: Record<string, unknown>
  output?: Record<string, unknown>
  errorText?: string
  toolCallId: string
}

function extractToolNameFromType(type: string): string {
  return type.replace('tool-', '')
}

function isValidToolPart(part: UIMessagePart<UIDataTypes, UITools>): boolean {
  return (
    part.type?.startsWith('tool-') &&
    'toolCallId' in part &&
    typeof part.toolCallId === 'string' &&
    'state' in part
  )
}

function createToolPartFromMessagePart(part: ToolMessagePart): ToolPart {
  return {
    type: extractToolNameFromType(part.type),
    state: part.state,
    input: part.input || {},
    output: part.output,
    errorText: part.errorText,
    toolCallId: part.toolCallId,
  }
}

function convertToToolPart(part: UIMessagePart<UIDataTypes, UITools>): ToolPart | null {
  if (!isValidToolPart(part)) {
    return null
  }

  return createToolPartFromMessagePart(part as ToolMessagePart)
}

function renderMessagePart(
  part: UIMessagePart<UIDataTypes, UITools>,
  index: number,
  isLastMessage: boolean,
  isStreaming: boolean,
): React.ReactNode {
  switch (part.type) {
    case 'text': {
      const textPart = part as UIMessagePart<UIDataTypes, UITools> & { text: string }
      return textPart.text ? (
        <MessageContent
          key={index}
          className="text-foreground prose dark:prose-invert prose-headings:text-foreground dark:prose-headings:text-foreground w-full min-w-0 flex-1 bg-transparent p-0"
          markdown
        >
          {textPart.text}
        </MessageContent>
      ) : null
    }

    case 'reasoning': {
      const reasoningPart = part as UIMessagePart<UIDataTypes, UITools> & { text: string }
      return reasoningPart.text ? (
        <Reasoning key={index} isStreaming={isLastMessage && isStreaming}>
          <ReasoningTrigger className="mb-1" textClassName="text-muted-foreground hover:underline">
            Reasoning
          </ReasoningTrigger>
          <ReasoningContent
            markdown
            className="ml-2 border-l border-l-slate-200 px-2 pb-1 text-muted-foreground dark:border-l-slate-700"
            contentClassName="prose-sm"
          >
            {reasoningPart.text}
          </ReasoningContent>
        </Reasoning>
      ) : null
    }

    default:
      if (part.type?.startsWith('tool-')) {
        const toolPart = convertToToolPart(part)
        if (toolPart) {
          return (
            <Tool
              key={`${toolPart.toolCallId}-${index}`}
              toolPart={toolPart}
              defaultOpen={isLastMessage && isStreaming}
            />
          )
        }
      }
      return null
  }
}

export const MessageComponent = memo(
  ({ message, isLastMessage, isStreaming }: MessageComponentProps) => {
    const isAssistant = message?.role === 'assistant'

    return (
      <Message
        className={cn(
          'mx-auto flex w-full max-w-3xl flex-col gap-2 px-2 md:px-10',
          isAssistant ? 'items-start' : 'items-end',
        )}
      >
        {isAssistant ? (
          <div className="group flex w-full flex-col gap-0 space-y-2">
            {message.parts?.map((part, index) =>
              renderMessagePart(part, index, isLastMessage, isStreaming),
            )}

            <MessageActions
              className={cn(
                '-ml-2.5 flex gap-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100',
                isLastMessage && 'opacity-100',
              )}
            >
              <MessageAction tooltip="Copy" delayDuration={100}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigator.clipboard.writeText(getMessageText(message))}
                >
                  <Copy />
                </Button>
              </MessageAction>
            </MessageActions>
          </div>
        ) : (
          <div className="group flex w-full flex-col items-end gap-1">
            <MessageContent className="bg-muted text-foreground max-w-[85%] px-5 py-2.5 whitespace-pre-wrap sm:max-w-[75%]">
              {getMessageText(message)}
            </MessageContent>
            <MessageActions
              className={cn(
                'flex gap-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100',
              )}
            >
              <MessageAction tooltip="Copy" delayDuration={100}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigator.clipboard.writeText(getMessageText(message))}
                >
                  <Copy />
                </Button>
              </MessageAction>
            </MessageActions>
          </div>
        )}
      </Message>
    )
  },
)

MessageComponent.displayName = 'MessageComponent'

const LoadingMessage = memo(() => (
  <Message className="mx-auto flex w-full max-w-3xl flex-col items-start gap-2 px-2 md:px-10">
    <div className="group flex w-full flex-col gap-0">
      <div className="text-foreground prose dark:prose-invert w-full min-w-0 flex-1 bg-transparent p-0">
        <Loader variant="typing" />
      </div>
    </div>
  </Message>
))

LoadingMessage.displayName = 'LoadingMessage'

const ErrorMessage = memo(({ error }: { error: Error }) => (
  <Message className="not-prose mx-auto flex w-full max-w-3xl flex-col items-start gap-2 px-0 md:px-10">
    <div className="group flex w-full flex-col items-start gap-0">
      <div className="text-primary flex min-w-0 flex-1 flex-row items-center gap-2 border-2 border-red-300 bg-red-300/20 px-2 py-1">
        <AlertTriangle size={16} className="text-red-500" />
        <p className="text-red-500">{error.message}</p>
      </div>
    </div>
  </Message>
))

ErrorMessage.displayName = 'ErrorMessage'

type PromptBarProps = {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  isLoading: boolean
  variant: 'centered' | 'bottom'
  selectedModel: string
  onModelChange: (model: string) => void
}

function PromptBar({
  value,
  onChange,
  onSubmit,
  isLoading,
  variant,
  selectedModel,
  onModelChange,
}: PromptBarProps) {
  return (
    <PromptInput
      isLoading={isLoading}
      value={value}
      onValueChange={onChange}
      onSubmit={onSubmit}
      className={cn(
        'border-input relative z-10 w-full border p-0 pt-1 shadow-xs',
        variant === 'centered' ? 'bg-sidebar' : 'bg-background',
      )}
    >
      <div className="flex flex-col">
        <PromptInputTextarea
          placeholder="Ask anything"
          className="text-foreground placeholder:text-muted-foreground min-h-[44px] pt-3 pl-4 text-base leading-[1.3] sm:text-base md:text-base"
        />

        <PromptInputActions className="mt-3 flex w-full items-center justify-between gap-2 p-2">
          <ModelSelector value={selectedModel} onValueChange={onModelChange} />
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              disabled={!value.trim() || isLoading === true}
              onClick={onSubmit}
              className="size-9"
            >
              {isLoading ? <span className="size-3 bg-white" /> : <ArrowUp size={18} />}
            </Button>
          </div>
        </PromptInputActions>
      </div>
    </PromptInput>
  )
}

type ChatInnerProps = {
  chatId?: string
  initialMessages?: UIMessage[]
  initialModel?: string
}

function ChatInner({
  chatId: providedChatId,
  initialMessages,
  initialModel,
  userId,
  isNewChat,
}: ChatInnerProps & { userId?: string; isNewChat?: boolean }) {
  const { context } = useAppContext()
  const [input, setInput] = useState('')
  const [selectedModel, setSelectedModel] = useState(initialModel ?? 'openai/gpt-5')
  const [hasUpdatedUrl, setHasUpdatedUrl] = useState(Boolean(initialMessages?.length))
  const createChatMutation = useCreateChatMutation()
  const updateChatMutation = useUpdateChatMutation()

  const actualChatIdRef = useRef<string | undefined>(providedChatId)

  const { messages, sendMessage, status, error } = useChat({
    id: providedChatId || 'new-chat',
    messages: initialMessages,
    onError: (error) => console.error('Chat error:', error),
  })

  const isEmpty = messages.length === 0
  const isBusy = status !== 'ready' || createChatMutation.isPending
  const containerRef = useRef<HTMLDivElement>(null)

  const handleModelChange = useCallback(
    async (model: string) => {
      const nextModel = model?.trim() ? model : 'gpt-5'
      setSelectedModel(nextModel)
      if (actualChatIdRef.current && !isNewChat) {
        try {
          await updateChatMutation.mutateAsync({
            chatId: actualChatIdRef.current,
            updates: { metadata: { model: nextModel } },
          })
        } catch (_err) {}
      }
    },
    [updateChatMutation, isNewChat],
  )

  const handleSubmit = useCallback(async () => {
    if (!input.trim() || isBusy) return

    const messageText = input
    setInput('')

    if (!hasUpdatedUrl && actualChatIdRef.current && isNewChat) {
      try {
        await createChatMutation.mutateAsync({
          id: actualChatIdRef.current,
          title: messageText.slice(0, 100),
          spaceId: context?.type === 'space' ? context.id : null,
          organizationId: context?.type === 'organization' ? context.id : null,
          metadata: { model: selectedModel },
        })
      } catch (err) {
        console.error('Failed to create chat:', err)
        return
      }

      window.history.replaceState({}, '', `/chat/${actualChatIdRef.current}`)
      setHasUpdatedUrl(true)
    }

    sendMessage({
      text: messageText,
      metadata: {
        model: selectedModel?.trim() ? selectedModel : 'gpt-5',
        chatId: actualChatIdRef.current,
        userId,
        spaceId: context?.type === 'space' ? context.id : null,
        organizationId: context?.type === 'organization' ? context.id : null,
      },
    })
  }, [
    input,
    isBusy,
    selectedModel,
    sendMessage,
    hasUpdatedUrl,
    userId,
    isNewChat,
    createChatMutation,
    context,
  ])

  return (
    <div ref={containerRef} className="flex h-[calc(92vh)] flex-col overflow-hidden">
      {isEmpty ? (
        <div className="flex flex-1 items-center justify-center px-3 md:px-5" key="centered">
          <div className="flex flex-col items-center justify-center w-full max-w-3xl">
            <PromptBar
              value={input}
              onChange={setInput}
              onSubmit={handleSubmit}
              isLoading={isBusy}
              variant="centered"
              selectedModel={selectedModel}
              onModelChange={handleModelChange}
            />
          </div>
        </div>
      ) : (
        <>
          <ChatContainerRoot className="relative flex-1 space-y-0 overflow-y-auto">
            <ChatContainerContent className="space-y-12 px-4 py-12">
              {messages.map((message, index) => {
                const isLastMessage = index === messages.length - 1
                return (
                  <MessageComponent
                    key={message.id}
                    message={message}
                    isLastMessage={isLastMessage}
                    isStreaming={status !== 'ready'}
                  />
                )
              })}

              {status === 'submitted' && <LoadingMessage />}
              {status === 'error' && error && <ErrorMessage error={error} />}
            </ChatContainerContent>
            <div className="absolute right-7 bottom-4">
              <ScrollButton className="shadow-sm" />
            </div>
          </ChatContainerRoot>

          <div className="inset-x-0 bottom-0 mx-auto w-full max-w-3xl shrink-0 px-3" key="bottom">
            <PromptBar
              value={input}
              onChange={setInput}
              onSubmit={handleSubmit}
              isLoading={isBusy}
              variant="bottom"
              selectedModel={selectedModel}
              onModelChange={handleModelChange}
            />
          </div>
        </>
      )}
    </div>
  )
}

type ChatProps = { chatId?: string; userId?: string; isNewChat?: boolean }

function Chat({ chatId, userId, isNewChat }: ChatProps) {
  const { data, error } = useKeepPrevious({
    queryKey: queryKeys.chats.byId(chatId || ''),
    queryFn: () => chatService.getChat(chatId!),
    enabled: Boolean(chatId) && !isNewChat,
  })

  if (!isNewChat && chatId && error) {
    return (
      <div className="flex h-[calc(92vh)] flex-col overflow-hidden">
        <ChatContainerRoot className="relative flex-1 space-y-0 overflow-y-auto">
          <ChatContainerContent className="space-y-6 px-4 py-12">
            <ErrorMessage error={error as Error} />
          </ChatContainerContent>
        </ChatContainerRoot>
      </div>
    )
  }

  const initialMessages = chatId && data ? (data.messages as UIMessage[]) : undefined
  const initialModel = (() => {
    const meta = (data?.metadata as Record<string, unknown> | undefined) ?? undefined
    const model = typeof meta?.model === 'string' ? (meta.model as string) : undefined
    return model
  })()

  return (
    <ChatInner
      chatId={chatId}
      initialMessages={initialMessages}
      initialModel={initialModel}
      userId={userId}
      isNewChat={isNewChat}
    />
  )
}

export { Chat }
