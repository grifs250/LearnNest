interface ErrorDetails {
  message: string;
  stack?: string;
  context?: Record<string, any>;
}

class ErrorTracker {
  private isDevelopment = process.env.NODE_ENV === 'development';

  captureError(error: Error, context?: Record<string, any>) {
    const errorDetails: ErrorDetails = {
      message: error.message,
      stack: error.stack,
      context,
    };

    if (this.isDevelopment) {
      console.error('Error captured:', errorDetails);
    } else {
      // In production, we would send this to an error tracking service
      // Example with Sentry:
      // Sentry.captureException(error, { extra: context });
      
      // For now, just log to console in a structured way
      console.error(
        JSON.stringify(
          {
            type: 'ERROR',
            timestamp: new Date().toISOString(),
            ...errorDetails,
          },
          null,
          2
        )
      );
    }
  }

  captureMessage(message: string, context?: Record<string, any>) {
    if (this.isDevelopment) {
      console.log('Message captured:', { message, context });
    } else {
      // In production, we would send this to an error tracking service
      // Example with Sentry:
      // Sentry.captureMessage(message, { extra: context });
      
      // For now, just log to console in a structured way
      console.log(
        JSON.stringify(
          {
            type: 'MESSAGE',
            timestamp: new Date().toISOString(),
            message,
            context,
          },
          null,
          2
        )
      );
    }
  }
}

export const errorTracker = new ErrorTracker(); 