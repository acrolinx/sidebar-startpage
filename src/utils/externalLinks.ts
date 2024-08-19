/*
 * Copyright 2023-present Acrolinx GmbH
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

import externalLinks from '../../config/externalLinks.json'; // This import requires "esModuleInterop"

export type ExternalLinks = typeof externalLinks.en;

export function getExternalLinks(lokale: string): ExternalLinks {
  if (lokale === 'de') {
    return externalLinks.de;
  }
  return externalLinks.en;
}
