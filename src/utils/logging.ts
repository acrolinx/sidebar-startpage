/*
 * Copyright 2017-present Acrolinx GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {AcrolinxPlugin, LogEntry, LogEntryType} from '@acrolinx/sidebar-interface';

let LOGGING_ENABLED = true;

let externalLog: AcrolinxPlugin['log'] | undefined;

function createLogEntry(type: LogEntryType, args: unknown[]): LogEntry {
  const [message, ...details] = args;
  if (typeof message === 'string') {
    return {type, message, details};
  } else {
    return {type, message: 'Details', details: args};
  }
}

export function log(...args: unknown[]) {
  if (!LOGGING_ENABLED) {
    return;
  }
  try {
    console.log(...args);
    if (externalLog) {
      externalLog(createLogEntry(LogEntryType.info, args));
    }
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
    if (externalLog) {
      externalLog(createLogEntry(LogEntryType.warning, args));
    }
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
    if (externalLog) {
      externalLog(createLogEntry(LogEntryType.error, args));
    }
  } catch (e) {
    // What should we do, log the problem ? :-)
  }
}

export function setLoggingEnabled(enabled: boolean) {
  LOGGING_ENABLED = enabled;
}

export function setExternalLog(newExternalLog: AcrolinxPlugin['log']) {
  externalLog = newExternalLog;
}

