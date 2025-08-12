interface LogContext {
  method: string
  url: string
  userId?: string
  requestId?: string
  startTime: number
}

interface RequestData {
  searchParams?: Record<string, string | null>
  body?: unknown
  params?: Record<string, string>
}

interface ResponseData {
  status: number
  success: boolean
  error?: string
  duration: number
}

class ApiLogger {
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  createContext(request: Request, userId?: string): LogContext {
    return {
      method: request.method,
      url: request.url,
      userId,
      requestId: this.generateRequestId(),
      startTime: Date.now(),
    }
  }

  logRequest(context: LogContext, data?: RequestData) {
    const logData = {
      type: 'api_request',
      requestId: context.requestId,
      method: context.method,
      url: context.url,
      userId: context.userId,
      ...data,
    }

    console.log('API Request:', JSON.stringify(logData, null, 2))
  }

  logResponse(context: LogContext, response: ResponseData) {
    const logData = {
      type: 'api_response',
      requestId: context.requestId,
      method: context.method,
      url: context.url,
      userId: context.userId,
      status: response.status,
      success: response.success,
      duration: `${response.duration}ms`,
      ...(response.error && { error: response.error }),
    }

    const logLevel = response.status >= 400 ? 'error' : 'info'
    console[logLevel]('API Response:', JSON.stringify(logData, null, 2))
  }

  logError(context: LogContext, error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined

    const logData = {
      type: 'api_error',
      requestId: context.requestId,
      method: context.method,
      url: context.url,
      userId: context.userId,
      error: errorMessage,
      ...(errorStack ? { stack: errorStack } : {}),
      duration: `${Date.now() - context.startTime}ms`,
    }

    console.error('API Error:', JSON.stringify(logData, null, 2))
  }

  logValidationError(context: LogContext, field: string, message: string, issues?: unknown) {
    const logData = {
      type: 'api_validation_error',
      requestId: context.requestId,
      method: context.method,
      url: context.url,
      userId: context.userId,
      field,
      message,
      ...(issues ? { issues } : {}),
      duration: `${Date.now() - context.startTime}ms`,
    }

    console.warn('API Validation Error:', JSON.stringify(logData, null, 2))
  }
}

export const apiLogger = new ApiLogger()
