import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js";

type PostgresChangeEvent = "INSERT" | "UPDATE" | "DELETE" | "*";

interface SubscriptionConfig {
  table: string;
  schema?: string;
  event?: PostgresChangeEvent;
  filter?: string;
}

interface ChannelSubscription {
  channel: RealtimeChannel;
  refCount: number;
  configs: SubscriptionConfig[];
  callbacks: Map<string, Set<(payload: RealtimePostgresChangesPayload<any>) => void>>;
}

class RealtimeManager {
  private subscriptions: Map<string, ChannelSubscription> = new Map();
  private callbackIdCounter = 0;

  /**
   * Generate a unique channel key based on configuration
   */
  private getChannelKey(channelName: string): string {
    return channelName;
  }

  /**
   * Generate a unique callback ID
   */
  private generateCallbackId(): string {
    return `cb_${++this.callbackIdCounter}_${Date.now()}`;
  }

  /**
   * Subscribe to a realtime channel with reference counting
   * Returns an unsubscribe function
   */
  subscribe(
    channelName: string,
    configs: SubscriptionConfig[],
    callback: (payload: RealtimePostgresChangesPayload<any>) => void
  ): () => void {
    const channelKey = this.getChannelKey(channelName);
    const callbackId = this.generateCallbackId();

    let subscription = this.subscriptions.get(channelKey);

    if (subscription) {
      // Channel already exists, increment ref count and add callback
      subscription.refCount++;

      // Add callback to each config's callback set
      // Note: We only add callbacks to existing configs. New configs on the same channel
      // should use the same configs as the original subscription for consistency.
      configs.forEach(config => {
        const configKey = this.getConfigKey(config);
        if (subscription!.callbacks.has(configKey)) {
          // Config exists, add callback to it
          subscription!.callbacks.get(configKey)!.add(callback);
        } else {
          // Config doesn't exist yet - this happens when multiple components use the same
          // channel name but with different table configs. We need to add a new listener.
          subscription!.callbacks.set(configKey, new Set([callback]));

          // Add the new postgres_changes listener to the existing channel
          subscription!.channel.on(
            "postgres_changes" as any,
            {
              event: config.event || "*",
              schema: config.schema || "public",
              table: config.table,
              filter: config.filter,
            },
            (payload: RealtimePostgresChangesPayload<any>) => {
              const callbackSet = this.subscriptions.get(channelKey)?.callbacks.get(configKey);
              if (callbackSet) {
                callbackSet.forEach(cb => cb(payload));
              }
            }
          );
        }
      });
    } else {
      // Create new channel
      const channel = supabase.channel(channelName);

      // Initialize callbacks map
      const callbacks = new Map<string, Set<(payload: RealtimePostgresChangesPayload<any>) => void>>();

      // Add postgres_changes listeners for each config
      configs.forEach(config => {
        const configKey = this.getConfigKey(config);
        callbacks.set(configKey, new Set([callback]));

        channel.on(
          "postgres_changes" as any,
          {
            event: config.event || "*",
            schema: config.schema || "public",
            table: config.table,
            filter: config.filter,
          },
          (payload: RealtimePostgresChangesPayload<any>) => {
            // Notify all callbacks for this config
            const callbackSet = this.subscriptions.get(channelKey)?.callbacks.get(configKey);
            if (callbackSet) {
              callbackSet.forEach(cb => cb(payload));
            }
          }
        );
      });

      channel.subscribe();

      subscription = {
        channel,
        refCount: 1,
        configs,
        callbacks,
      };

      this.subscriptions.set(channelKey, subscription);
    }

    // Return unsubscribe function
    return () => {
      this.unsubscribe(channelKey, configs, callback);
    };
  }

  /**
   * Get a unique key for a subscription config
   */
  private getConfigKey(config: SubscriptionConfig): string {
    return `${config.table}:${config.event || "*"}:${config.filter || "none"}`;
  }

  /**
   * Unsubscribe from a channel
   */
  private unsubscribe(
    channelKey: string,
    configs: SubscriptionConfig[],
    callback: (payload: RealtimePostgresChangesPayload<any>) => void
  ): void {
    const subscription = this.subscriptions.get(channelKey);
    if (!subscription) return;

    // Remove callback from each config
    configs.forEach(config => {
      const configKey = this.getConfigKey(config);
      subscription.callbacks.get(configKey)?.delete(callback);
    });

    // Decrement ref count
    subscription.refCount--;

    // If no more references, remove the channel
    if (subscription.refCount <= 0) {
      supabase.removeChannel(subscription.channel);
      this.subscriptions.delete(channelKey);
    }
  }

  /**
   * Get the current number of active channels
   */
  getActiveChannelCount(): number {
    return this.subscriptions.size;
  }

  /**
   * Get debug info about active subscriptions
   */
  getDebugInfo(): { channelName: string; refCount: number; configs: string[] }[] {
    return Array.from(this.subscriptions.entries()).map(([key, sub]) => ({
      channelName: key,
      refCount: sub.refCount,
      configs: sub.configs.map(c => this.getConfigKey(c)),
    }));
  }

  /**
   * Clean up all subscriptions (useful for logout)
   */
  cleanup(): void {
    this.subscriptions.forEach((subscription) => {
      supabase.removeChannel(subscription.channel);
    });
    this.subscriptions.clear();
  }
}

// Singleton instance
export const realtimeManager = new RealtimeManager();

// React hook for using the realtime manager
import { useEffect, useRef } from "react";

export function useRealtimeSubscription(
  channelName: string,
  configs: SubscriptionConfig[],
  callback: (payload: RealtimePostgresChangesPayload<any>) => void,
  enabled: boolean = true
): void {
  const callbackRef = useRef(callback);

  // Keep callback ref updated
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;

    const stableCallback = (payload: RealtimePostgresChangesPayload<any>) => {
      callbackRef.current(payload);
    };

    const unsubscribe = realtimeManager.subscribe(channelName, configs, stableCallback);

    return () => {
      unsubscribe();
    };
  }, [channelName, JSON.stringify(configs), enabled]);
}
