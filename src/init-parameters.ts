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

import {
  InitParameters, SoftwareComponent,
  SoftwareComponentCategory
} from '@acrolinx/sidebar-interface';
import {isCorsWithCredentialsNeeded} from './acrolinx-sidebar-integration/utils/utils';
import {SERVER_SELECTOR_VERSION} from './constants';
import {getTranslation} from './localization';
import {warn} from './utils/logging';


export function hackInitParameters(initParameters: InitParameters, serverAddress: string): InitParameters {
  const ignoreAccessToken = initParameters.accessToken && initParameters.showServerSelector;
  if (ignoreAccessToken) {
    warn(`Ignore accessToken because showServerSelector=${initParameters.showServerSelector}`);
  }
  return {
    ...initParameters,
    serverAddress: serverAddress,
    accessToken: ignoreAccessToken ? undefined : initParameters.accessToken,
    showServerSelector: false,
    corsWithCredentials: initParameters.corsWithCredentials || isCorsWithCredentialsNeeded(serverAddress),
    supported: {...initParameters.supported, showServerSelector: initParameters.showServerSelector},
    clientComponents: extendClientComponents(initParameters.clientComponents)
  };
}

export function extendClientComponents(clientComponents?: SoftwareComponent[]): SoftwareComponent[] {
  return (clientComponents || []).concat({
    id: 'com.acrolinx.serverselector',
    name: getTranslation().serverSelector.aboutItems.serverSelector,
    version: SERVER_SELECTOR_VERSION,
    category: SoftwareComponentCategory.DEFAULT
  });
}

export function getClientComponentFallbackId(name: string | undefined | null, index: number): string {
  const idFromName = (name || '').replace(/[^a-zA-Z0-9]+/g, '.');
  return (idFromName === '.' || idFromName === '')
    ? 'unknown.client.component.id.with.index.' + index
    : idFromName;
}

export function sanitizeClientComponent(clientComponent: Partial<SoftwareComponent>, index: number): SoftwareComponent {
  return {
    ...clientComponent,
    id: clientComponent.id || getClientComponentFallbackId(clientComponent.name, index),
    name: clientComponent.name || clientComponent.id || 'unknown client component name',
    version: clientComponent.version || '0.0.0.0',
  };
}
