import {AcrolinxPlugin, AcrolinxSidebar, Message} from '@acrolinx/sidebar-interface';

interface AcrolinxPluginStorageExtension {
  setStorageItem(key: string, value: string): void;
  removeStorageItem(key: string): void;
}

//ToDo: Move this to sidebar-interface
interface ReuseSuggestion {
  preferredPhrase: string,
  description: string
}
export interface ReuseSearchResult {
  requestId: string,
  results: ReuseSuggestion[]
}

export interface ExtendedAcrolinxPlugin extends AcrolinxPlugin, AcrolinxPluginStorageExtension {}

export interface AcrolinxPluginWithReuse extends AcrolinxPlugin {
  onReusePrefixSearchResult(reuseSearchResult: ReuseSearchResult): void;
  onReusePrefixSearchFailed(message: Message): void;
}

export interface SetStorageProps {
  data: Record<string, string>;
}

export interface ExtendedAcrolinxSidebar extends AcrolinxSidebar {
  setStorage(props: SetStorageProps): void;
  onReusePrefixSearchResult(reuseSearchResult: ReuseSearchResult): void;
}

export interface AcrolinxSidebarWithReuse extends AcrolinxSidebar {
  reusePrefixSearch(prefix: string): void;
}
