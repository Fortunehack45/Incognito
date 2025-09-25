import { EventEmitter } from 'events';

// This is a simple event emitter that allows us to broadcast errors
// from anywhere in the app and listen for them in a central location.

type ErrorEvents = {
  'permission-error': (error: Error) => void;
};

// We extend EventEmitter to have typed events.
class TypedEventEmitter<T extends Record<string, (...args: any[]) => void>> {
  private emitter = new EventEmitter();

  on<E extends keyof T>(event: E, listener: T[E]): void {
    this.emitter.on(event as string, listener);
  }

  off<E extends keyof T>(event: E, listener: T[E]): void {
    this.emitter.off(event as string, listener);
  }

  emit<E extends keyof T>(event: E, ...args: Parameters<T[E]>): void {
    this.emitter.emit(event as string, ...args);
  }
}

export const errorEmitter = new TypedEventEmitter<ErrorEvents>();
