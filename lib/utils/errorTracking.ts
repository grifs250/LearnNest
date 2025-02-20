'use client';

interface ErrorContext {
  userId?: string;
  action?: string;
  metadata?: Record<string, any>;
}

class ErrorTracker {
  private static instance: ErrorTracker;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker();
    }
    return ErrorTracker.instance;
  }

  public init() {
    if (this.isInitialized) return;

    // Initialize error tracking service here
    // Example with Sentry:
    // Sentry.init({
    //   dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    //   environment: process.env.NODE_ENV,
    // });

    this.isInitialized = true;
  }

  public captureError(error: Error, context?: ErrorContext) {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error:', error);
      if (context) {
        console.error('Context:', context);
      }
    }

    // Send to error tracking service
    // Example with Sentry:
    // Sentry.withScope((scope) => {
    //   if (context?.userId) scope.setUser({ id: context.userId });
    //   if (context?.action) scope.setTag('action', context.action);
    //   if (context?.metadata) scope.setExtras(context.metadata);
    //   Sentry.captureException(error);
    // });
  }

  public captureMessage(message: string, context?: ErrorContext) {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Message:', message);
      if (context) {
        console.log('Context:', context);
      }
    }

    // Send to error tracking service
    // Example with Sentry:
    // Sentry.withScope((scope) => {
    //   if (context?.userId) scope.setUser({ id: context.userId });
    //   if (context?.action) scope.setTag('action', context.action);
    //   if (context?.metadata) scope.setExtras(context.metadata);
    //   Sentry.captureMessage(message);
    // });
  }
}

export const errorTracker = ErrorTracker.getInstance(); 