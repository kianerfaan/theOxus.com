/**
 * theOxus - Resilience Module
 * 
 * This module provides circuit breaker and retry mechanisms to handle
 * traffic spikes and external service failures gracefully.
 * 
 * @license Apache-2.0
 */

import fetch from 'node-fetch';

/**
 * Circuit breaker states
 */
enum CircuitBreakerState {
  CLOSED = 'CLOSED',     // Normal operation
  OPEN = 'OPEN',         // Circuit is open, blocking requests
  HALF_OPEN = 'HALF_OPEN' // Testing if service has recovered
}

/**
 * Circuit breaker configuration options
 */
interface CircuitBreakerOptions {
  name: string;
  failureThreshold: number;    // Number of failures before opening circuit
  resetTimeout: number;        // Time to wait before attempting reset (ms)
  monitoringWindow: number;    // Time window for failure rate calculation (ms)
  successThreshold?: number;   // Successes needed in half-open to close circuit
}

/**
 * Retry configuration options
 */
interface RetryOptions {
  maxRetries: number;
  baseDelay: number;        // Base delay in ms
  maxDelay: number;         // Maximum delay in ms
  jitterFactor: number;     // Jitter factor (0-1)
  retryCondition?: (error: any) => boolean;
}

/**
 * Circuit breaker implementation
 */
class CircuitBreaker {
  private state: CircuitBreakerState = CircuitBreakerState.CLOSED;
  private failures: number = 0;
  private successes: number = 0;
  private lastFailureTime: number = 0;
  private recentCalls: Array<{ timestamp: number; success: boolean }> = [];

  constructor(private options: CircuitBreakerOptions) {}

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitBreakerState.OPEN) {
      if (Date.now() - this.lastFailureTime < this.options.resetTimeout) {
        throw new Error(`Circuit breaker is OPEN for ${this.options.name}. Service temporarily unavailable.`);
      } else {
        // Transition to half-open to test service
        this.state = CircuitBreakerState.HALF_OPEN;
        console.log(`Circuit breaker transitioning to HALF_OPEN for ${this.options.name}`);
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.recordCall(true);
    
    if (this.state === CircuitBreakerState.HALF_OPEN) {
      this.successes++;
      const successThreshold = this.options.successThreshold || 1;
      
      if (this.successes >= successThreshold) {
        this.state = CircuitBreakerState.CLOSED;
        this.failures = 0;
        this.successes = 0;
        console.log(`Circuit breaker CLOSED for ${this.options.name} - service recovered`);
      }
    }
  }

  private onFailure(): void {
    this.recordCall(false);
    this.lastFailureTime = Date.now();
    
    if (this.state === CircuitBreakerState.HALF_OPEN) {
      this.state = CircuitBreakerState.OPEN;
      this.successes = 0;
      console.log(`Circuit breaker OPEN for ${this.options.name} - half-open test failed`);
      return;
    }

    const failureRate = this.getFailureRate();
    
    if (failureRate >= this.options.failureThreshold) {
      this.state = CircuitBreakerState.OPEN;
      console.log(`Circuit breaker OPEN for ${this.options.name} - failure threshold exceeded (${failureRate}% failure rate)`);
    }
  }

  private recordCall(success: boolean): void {
    const now = Date.now();
    this.recentCalls.push({ timestamp: now, success });
    
    // Clean up old calls outside monitoring window
    this.recentCalls = this.recentCalls.filter(
      call => now - call.timestamp < this.options.monitoringWindow
    );
  }

  private getFailureRate(): number {
    if (this.recentCalls.length === 0) return 0;
    
    const failures = this.recentCalls.filter(call => !call.success).length;
    return (failures / this.recentCalls.length) * 100;
  }

  /**
   * Get current circuit breaker status
   */
  getStatus() {
    return {
      name: this.options.name,
      state: this.state,
      failureRate: this.getFailureRate(),
      recentCalls: this.recentCalls.length,
      lastFailureTime: this.lastFailureTime
    };
  }
}

/**
 * Retry mechanism with exponential backoff and jitter
 */
class RetryMechanism {
  constructor(private options: RetryOptions) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: any;
    
    for (let attempt = 0; attempt <= this.options.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        // Check if we should retry based on error condition
        if (this.options.retryCondition && !this.options.retryCondition(error)) {
          throw error;
        }
        
        // Don't wait after the last attempt
        if (attempt === this.options.maxRetries) {
          break;
        }
        
        const delay = this.calculateDelay(attempt);
        console.log(`Retry attempt ${attempt + 1}/${this.options.maxRetries} after ${delay}ms delay`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  }

  private calculateDelay(attempt: number): number {
    // Exponential backoff: baseDelay * 2^attempt
    const exponentialDelay = this.options.baseDelay * Math.pow(2, attempt);
    
    // Apply maximum delay limit
    const boundedDelay = Math.min(exponentialDelay, this.options.maxDelay);
    
    // Add jitter to prevent thundering herd
    const jitter = boundedDelay * this.options.jitterFactor * Math.random();
    
    return boundedDelay + jitter;
  }
}

/**
 * Resilient HTTP client that combines circuit breaker and retry mechanisms
 */
class ResilientHttpClient {
  private circuitBreakers = new Map<string, CircuitBreaker>();
  private retryMechanism: RetryMechanism;

  constructor(retryOptions: RetryOptions) {
    this.retryMechanism = new RetryMechanism(retryOptions);
  }

  /**
   * Get or create a circuit breaker for a service
   */
  private getCircuitBreaker(serviceName: string, options: CircuitBreakerOptions): CircuitBreaker {
    if (!this.circuitBreakers.has(serviceName)) {
      this.circuitBreakers.set(serviceName, new CircuitBreaker(options));
    }
    return this.circuitBreakers.get(serviceName)!;
  }

  /**
   * Make a resilient HTTP request with circuit breaker and retry protection
   */
  async request(url: string, options: any = {}, circuitBreakerOptions: CircuitBreakerOptions): Promise<any> {
    const serviceName = circuitBreakerOptions.name;
    const circuitBreaker = this.getCircuitBreaker(serviceName, circuitBreakerOptions);

    return await circuitBreaker.execute(async () => {
      return await this.retryMechanism.execute(async () => {
        const response = await fetch(url, options);
        
        // Consider 4xx errors as non-retryable (except 429 rate limiting)
        if (response.status >= 400 && response.status < 500 && response.status !== 429) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return response;
      });
    });
  }

  /**
   * Get status of all circuit breakers
   */
  getCircuitBreakerStatus() {
    const status: any = {};
    this.circuitBreakers.forEach((breaker, name) => {
      status[name] = breaker.getStatus();
    });
    return status;
  }
}

// Create default configurations for different service types
const RSS_CIRCUIT_BREAKER_CONFIG: CircuitBreakerOptions = {
  name: 'RSS_FEEDS',
  failureThreshold: 50, // 50% failure rate
  resetTimeout: 30000,  // 30 seconds
  monitoringWindow: 60000, // 1 minute window
  successThreshold: 2
};

const AI_CIRCUIT_BREAKER_CONFIG: CircuitBreakerOptions = {
  name: 'MISTRAL_AI',
  failureThreshold: 30, // 30% failure rate (more sensitive for paid API)
  resetTimeout: 60000,  // 1 minute
  monitoringWindow: 120000, // 2 minute window
  successThreshold: 1
};

const EXTERNAL_API_CIRCUIT_BREAKER_CONFIG: CircuitBreakerOptions = {
  name: 'EXTERNAL_API',
  failureThreshold: 40, // 40% failure rate
  resetTimeout: 45000,  // 45 seconds
  monitoringWindow: 90000, // 90 seconds window
  successThreshold: 2
};

const DEFAULT_RETRY_CONFIG: RetryOptions = {
  maxRetries: 3,
  baseDelay: 100,      // Start with 100ms
  maxDelay: 10000,     // Max 10 seconds
  jitterFactor: 0.3,   // 30% jitter
  retryCondition: (error: any) => {
    // Retry on network errors, timeouts, and 5xx/429 status codes
    const message = error.message?.toLowerCase() || '';
    return message.includes('timeout') || 
           message.includes('network') ||
           message.includes('enotfound') ||
           message.includes('econnreset') ||
           message.includes('http 5') ||
           message.includes('http 429');
  }
};

// Export singleton instances
export const rssHttpClient = new ResilientHttpClient(DEFAULT_RETRY_CONFIG);
export const aiHttpClient = new ResilientHttpClient({
  ...DEFAULT_RETRY_CONFIG,
  maxRetries: 2, // Fewer retries for paid AI API
  baseDelay: 1000, // Longer base delay for AI API
});
export const externalApiClient = new ResilientHttpClient(DEFAULT_RETRY_CONFIG);

export {
  RSS_CIRCUIT_BREAKER_CONFIG,
  AI_CIRCUIT_BREAKER_CONFIG,
  EXTERNAL_API_CIRCUIT_BREAKER_CONFIG,
  CircuitBreakerState,
  ResilientHttpClient
};

/**
 * Get overall system resilience status
 */
export function getResilienceStatus() {
  return {
    timestamp: new Date().toISOString(),
    circuitBreakers: {
      rss: rssHttpClient.getCircuitBreakerStatus(),
      ai: aiHttpClient.getCircuitBreakerStatus(),
      external: externalApiClient.getCircuitBreakerStatus()
    }
  };
}