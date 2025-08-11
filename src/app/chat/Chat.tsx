'use client'

import { ChatContainerContent, ChatContainerRoot } from '@/components/ui/chat-container'
import { DotsLoader } from '@/components/ui/loader'
import { Message, MessageAction, MessageActions, MessageContent } from '@/components/ui/message'
import { PromptInput, PromptInputActions, PromptInputTextarea } from '@/components/ui/prompt-input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { AlertTriangle, ArrowUp, Copy, ThumbsDown, ThumbsUp } from 'lucide-react'
import { memo, useState } from 'react'

type ChatMessagePart = { type: 'text'; text: string }
type ChatMessage = { id: string; role: 'user' | 'assistant'; parts: ChatMessagePart[] }

type MessageComponentProps = {
  message: ChatMessage
  isLastMessage: boolean
}

export const MessageComponent = memo(({ message, isLastMessage }: MessageComponentProps) => {
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
          <MessageContent
            className="text-foreground prose w-full min-w-0 flex-1 bg-transparent p-0"
            markdown
          >
            {message?.parts
              .filter((part: any) => part.type === 'text')
              .map((part: any) => part.text)
              .join('')}
          </MessageContent>

          <MessageActions
            className={cn(
              '-ml-2.5 flex gap-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100',
              isLastMessage && 'opacity-100',
            )}
          >
            <MessageAction tooltip="Copy" delayDuration={100}>
              <Button variant="ghost" size="icon">
                <Copy />
              </Button>
            </MessageAction>
            <MessageAction tooltip="Upvote" delayDuration={100}>
              <Button variant="ghost" size="icon">
                <ThumbsUp />
              </Button>
            </MessageAction>
            <MessageAction tooltip="Downvote" delayDuration={100}>
              <Button variant="ghost" size="icon">
                <ThumbsDown />
              </Button>
            </MessageAction>
          </MessageActions>
        </div>
      ) : (
        <div className="group flex w-full flex-col items-end gap-1">
          <MessageContent className="bg-muted text-foreground max-w-[85%] px-5 py-2.5 whitespace-pre-wrap sm:max-w-[75%]">
            {message?.parts.map((part: any) => (part.type === 'text' ? part.text : null)).join('')}
          </MessageContent>
          <MessageActions
            className={cn(
              'flex gap-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100',
            )}
          >
            <MessageAction tooltip="Copy" delayDuration={100}>
              <Button variant="ghost" size="icon">
                <Copy />
              </Button>
            </MessageAction>
          </MessageActions>
        </div>
      )}
    </Message>
  )
})

MessageComponent.displayName = 'MessageComponent'

const LoadingMessage = memo(() => (
  <Message className="mx-auto flex w-full max-w-3xl flex-col items-start gap-2 px-2 md:px-10">
    <div className="group flex w-full flex-col gap-0">
      <div className="text-foreground prose w-full min-w-0 flex-1 bg-transparent p-0">
        <DotsLoader />
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
}

function PromptBar({ value, onChange, onSubmit, isLoading, variant }: PromptBarProps) {
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
          <div />
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

function Chat() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [status, setStatus] = useState<'ready' | 'submitted' | 'error'>('ready')
  const [error, setError] = useState<Error | null>(null)

  const simulateAssistantResponse = (text: string): string => {
    const now = new Date()
    const lower = text.toLowerCase()

    const formatTime = (timeZone: string) =>
      new Intl.DateTimeFormat('en-US', {
        timeZone,
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(now)

    if (lower.includes('current date')) {
      return `Today is ${now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })}.`
    }

    if (lower.includes('tokyo')) {
      return `Current time in Tokyo: ${formatTime('Asia/Tokyo')}`
    }

    if (lower.includes('europe/paris') || lower.includes('paris')) {
      return `Current time in Paris: ${formatTime('Europe/Paris')}`
    }

    return 'This is a simulated response.'
  }

  const handleSubmit = () => {
    const trimmed = input.trim()
    if (!trimmed) return

    const userMessage: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      role: 'user',
      parts: [{ type: 'text', text: trimmed }],
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setStatus('submitted')

    setTimeout(() => {
      try {
        const responseText = simulateAssistantResponse(trimmed)
        const assistantMessage: ChatMessage = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          role: 'assistant',
          parts: [{ type: 'text', text: responseText }],
        }
        setMessages((prev) => [...prev, assistantMessage])
        setStatus('ready')
      } catch (_) {
        setError(new Error('Failed to simulate response'))
        setStatus('error')
      }
    }, 600)
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {messages.length === 0 ? (
        <div className="flex flex-1 items-center justify-center px-3 md:px-5" key="centered">
          <div className="flex flex-col items-center justify-center w-full max-w-3xl">
            <PromptBar
              value={input}
              onChange={setInput}
              onSubmit={handleSubmit}
              isLoading={status !== 'ready'}
              variant="centered"
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
                  />
                )
              })}

              {status === 'submitted' && <LoadingMessage />}
              {status === 'error' && error && <ErrorMessage error={error} />}
            </ChatContainerContent>
          </ChatContainerRoot>

          <div
            className="inset-x-0 bottom-0 mx-auto w-full max-w-3xl shrink-0 px-3 pb-3 md:px-5 md:pb-5"
            key="bottom"
          >
            <PromptBar
              value={input}
              onChange={setInput}
              onSubmit={handleSubmit}
              isLoading={status !== 'ready'}
              variant="bottom"
            />
          </div>
        </>
      )}
    </div>
  )
}

export default Chat
