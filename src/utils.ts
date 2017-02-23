
export type ErrorFirstCallback<T> = (error?: Error | null, result?: T) => void;

export function $(selector: string): HTMLElement | undefined {
  return document.querySelector(selector) as HTMLElement;
}

export function hide(el: HTMLElement) {
  el.style.display = 'none';
}

export function show(el: HTMLElement) {
  el.style.display = 'block';
}