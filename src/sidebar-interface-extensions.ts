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

export enum UILanguage {
  Default = 'default',
  English = 'en',
  German = 'de',
  French = 'fr',
  Japanese = 'ja',
  Swedish = 'sv'
}

export interface ExtendedAcrolinxPlugin extends AcrolinxPlugin, AcrolinxPluginStorageExtension {}

export interface AcrolinxPluginWithReuse extends AcrolinxPlugin {
  onReusePrefixSearchResult?(reuseSearchResult: ReuseSearchResult): void;
  onReusePrefixSearchFailed?(message: Message): void;
  openReusePanel?(): void;
  onUiLanguageChanged?(uiLanguage: UILanguage): void;
}

export interface SetStorageProps {
  data: Record<string, string>;
}

export interface ExtendedAcrolinxSidebar extends AcrolinxSidebar {
  setStorage(props: SetStorageProps): void;
}

export interface AcrolinxSidebarWithReuse extends AcrolinxSidebar {
  reusePrefixSearch(prefix: string): void;
}
