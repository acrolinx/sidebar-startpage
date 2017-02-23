
export type ErrorFirstCallback<T> = (error?: Error | null, result?: T) => void;

export function $(selector: string): HTMLElement | undefined {
  return document.querySelector(selector) as HTMLElement;
}