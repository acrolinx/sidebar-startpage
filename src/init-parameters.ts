import {
  InitParameters, SoftwareComponent,
  SoftwareComponentCategory
} from "./acrolinx-sidebar-integration/acrolinx-libs/plugin-interfaces";
import {isCorsWithCredentialsNeeded} from "./acrolinx-sidebar-integration/utils/utils";
import {SERVER_SELECTOR_VERSION} from "./constants";


export function hackInitParameters(initParameters: InitParameters, serverAddress: string): InitParameters {
  return {
    ...initParameters,
    serverAddress: serverAddress,
    showServerSelector: false,
    corsWithCredentials: initParameters.corsWithCredentials || isCorsWithCredentialsNeeded(serverAddress),
    supported: {...initParameters.supported, showServerSelector: initParameters.showServerSelector},
    clientComponents: extendClientComponents(initParameters.clientComponents)
  };
}

export function extendClientComponents(clientComponents?: SoftwareComponent[]): SoftwareComponent[] {
  return (clientComponents || []).concat({
    id: 'com.acrolinx.serverselector',
    name: 'Server Selector',
    version: SERVER_SELECTOR_VERSION,
    category: SoftwareComponentCategory.DETAIL
  });
}