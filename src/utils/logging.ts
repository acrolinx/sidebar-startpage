/* tslint:disable:no-console */

const LOGGING_ENABLED = true;

export function log(...args: any[]) {
  if (!LOGGING_ENABLED) {
    return;
  }
  try {
    console.log(...args);
  } catch (e) {
    // What should we do, log the problem ? :-)
  }
}

export function warn(...args: any[]) {
  if (!LOGGING_ENABLED) {
    return;
  }
  try {
    console.warn(...args);
  } catch (e) {
    // What should we do, log the problem ? :-)
  }
}

export function error(...args: any[]) {
  if (!LOGGING_ENABLED) {
    return;
  }
  try {
    console.error(...args);
  } catch (e) {
    // What should we do, log the problem ? :-)
  }
}
