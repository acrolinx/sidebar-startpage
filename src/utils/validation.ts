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

import {isHttpsRequired, isHttpUrl, SanitizeOpts, sanitizeServerAddress, validateUrl} from "./utils";
import {Err, Ok, Result} from "./result";
import {getTranslation} from "../localization";

export function sanitizeAndValidateServerAddress(serverAddressInput: string, opts: SanitizeOpts): Result<string, string> {
  const serverUrl = sanitizeServerAddress(serverAddressInput.trim(), opts);

  if (isHttpUrl(serverUrl) && isHttpsRequired(opts)) {
    return new Err(getTranslation().serverSelector.message.serverIsNotSecure);
  }

  if (!validateUrl(serverUrl)) {
    return new Err(getTranslation().serverSelector.message.invalidServerAddress);
  }

  return new Ok(serverUrl);
}

