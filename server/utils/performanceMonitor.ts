/**
 * theOxus - Performance Monitoring Module
 * 
 * Tracks performance improvements from C-style optimized date utilities
 * and provides metrics for system monitoring.
 * 
 * @license Apache-2.0
 */

interface PerformanceMetrics {
  operation: string;
  duration: number;
  timestamp: number;
  itemCount?: number;
  optimizedPath: boolean;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private readonly maxMetrics = 1000; // Keep last 1000 measurements

  /**
   * Records performance metrics for date operations
   */
  recordMetric(operation: string, duration: number, itemCount?: number, optimizedPath: boolean = true): void {
    const metric: PerformanceMetrics = {
      operation,
      duration,
      timestamp: Date.now(),
      itemCount,
      optimizedPath
    };

    this.metrics.push(metric);

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  /**
   * Measures execution time of a function
   */
  async measureAsync<T>(
    operation: string, 
    fn: () => Promise<T>, 
    itemCount?: number,
    optimizedPath: boolean = true
  ): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      this.recordMetric(operation, duration, itemCount, optimizedPath);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.recordMetric(`${operation}_error`, duration, itemCount, optimizedPath);
      throw error;
    }
  }

  /**
   * Measures execution time of a synchronous function
   */
  measure<T>(
    operation: string, 
    fn: () => T, 
    itemCount?: number,
    optimizedPath: boolean = true
  ): T {
    const start = performance.now();
    try {
      const result = fn();
      const duration = performance.now() - start;
      this.recordMetric(operation, duration, itemCount, optimizedPath);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.recordMetric(`${operation}_error`, duration, itemCount, optimizedPath);
      throw error;
    }
  }

  /**
   * Gets performance statistics for an operation
   */
  getStats(operation: string, timeWindowMs: number = 60000): {
    avgDuration: number;
    minDuration: number;
    maxDuration: number;
    totalOperations: number;
    optimizedCount: number;
    fallbackCount: number;
    throughput: number; // operations per second
  } {
    const now = Date.now();
    const relevantMetrics = this.metrics.filter(
      m => m.operation === operation && (now - m.timestamp) <= timeWindowMs
    );

    if (relevantMetrics.length === 0) {
      return {
        avgDuration: 0,
        minDuration: 0,
        maxDuration: 0,
        totalOperations: 0,
        optimizedCount: 0,
        fallbackCount: 0,
        throughput: 0
      };
    }

    const durations = relevantMetrics.map(m => m.duration);
    const optimizedCount = relevantMetrics.filter(m => m.optimizedPath).length;
    const fallbackCount = relevantMetrics.length - optimizedCount;

    return {
      avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      totalOperations: relevantMetrics.length,
      optimizedCount,
      fallbackCount,
      throughput: relevantMetrics.length / (timeWindowMs / 1000)
    };
  }

  /**
   * Gets overall system performance summary
   */
  getSystemSummary(timeWindowMs: number = 300000): {
    dateParsingStats: ReturnType<typeof this.getStats>;
    articleFilteringStats: ReturnType<typeof this.getStats>;
    dateFormattingStats: ReturnType<typeof this.getStats>;
    optimizationEffectiveness: number; // percentage using optimized path
  } {
    const dateParsingStats = this.getStats('parseRSSDate', timeWindowMs);
    const articleFilteringStats = this.getStats('filterRecentArticles', timeWindowMs);
    const dateFormattingStats = this.getStats('formatArticleDate', timeWindowMs);

    const totalOps = dateParsingStats.totalOperations + 
                    articleFilteringStats.totalOperations + 
                    dateFormattingStats.totalOperations;
    
    const totalOptimized = dateParsingStats.optimizedCount + 
                          articleFilteringStats.optimizedCount + 
                          dateFormattingStats.optimizedCount;

    const optimizationEffectiveness = totalOps > 0 ? (totalOptimized / totalOps) * 100 : 0;

    return {
      dateParsingStats,
      articleFilteringStats,
      dateFormattingStats,
      optimizationEffectiveness
    };
  }

  /**
   * Logs performance summary to console
   */
  logPerformanceSummary(): void {
    const summary = this.getSystemSummary();
    
    console.log('\n=== OXUS DATE UTILITIES PERFORMANCE SUMMARY ===');
    console.log(`Optimization Effectiveness: ${summary.optimizationEffectiveness.toFixed(1)}%`);
    
    console.log('\nDate Parsing:');
    console.log(`  Operations: ${summary.dateParsingStats.totalOperations}`);
    console.log(`  Avg Duration: ${summary.dateParsingStats.avgDuration.toFixed(2)}ms`);
    console.log(`  Optimized: ${summary.dateParsingStats.optimizedCount}, Fallback: ${summary.dateParsingStats.fallbackCount}`);
    
    console.log('\nArticle Filtering:');
    console.log(`  Operations: ${summary.articleFilteringStats.totalOperations}`);
    console.log(`  Avg Duration: ${summary.articleFilteringStats.avgDuration.toFixed(2)}ms`);
    console.log(`  Optimized: ${summary.articleFilteringStats.optimizedCount}, Fallback: ${summary.articleFilteringStats.fallbackCount}`);
    
    console.log('\nDate Formatting:');
    console.log(`  Operations: ${summary.dateFormattingStats.totalOperations}`);
    console.log(`  Avg Duration: ${summary.dateFormattingStats.avgDuration.toFixed(2)}ms`);
    console.log(`  Optimized: ${summary.dateFormattingStats.optimizedCount}, Fallback: ${summary.dateFormattingStats.fallbackCount}`);
    
    console.log('===============================================\n');
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Auto-log performance summary every 5 minutes
setInterval(() => {
  performanceMonitor.logPerformanceSummary();
}, 5 * 60 * 1000);