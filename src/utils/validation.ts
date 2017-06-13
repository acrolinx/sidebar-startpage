import {isHttpsRequired, SanitizeOpts, sanitizeServerAddress, startsWith, validateUrl} from "./utils";
import {Err, Ok, Result} from "./result";
import {getTranslation} from "../localization";

export function sanitizeAndValidateServerAddress(serverAddressInput: string, opts: SanitizeOpts): Result<string, string> {
  const serverUrl = sanitizeServerAddress(serverAddressInput.trim(), opts);

  if (startsWith(serverUrl, 'http:') && isHttpsRequired(opts)) {
    return new Err(getTranslation().serverSelector.message.serverIsNotSecure);
  }

  if (!validateUrl(serverUrl)) {
    return new Err(getTranslation().serverSelector.message.invalidServerAddress);
  }

  return new Ok(serverUrl);
}

