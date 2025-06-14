interface RetryOptions {
  maxAttempts: number;
  delay: number;
  backoff?: number;
}

export class RetryUtils {
  static async withRetry<T>(
    operation: () => Promise<T>,
    options: RetryOptions
  ): Promise<T> {
    let lastError: Error = new Error('Operation not yet attempted');
    let attempt = 0;

    while (attempt < options.maxAttempts) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error 
          ? error 
          : new Error(String(error));
        attempt++;

        if (attempt === options.maxAttempts) {
          break;
        }

        // Calculate delay with exponential backoff
        const backoffDelay = options.delay * Math.pow(options.backoff || 2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
      }
    }

    throw new Error(`Operation failed after ${options.maxAttempts} attempts: ${lastError.message}`);
  }
}
