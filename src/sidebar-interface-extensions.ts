import {AcrolinxPlugin, AcrolinxSidebar} from '@acrolinx/sidebar-interface';

interface AcrolinxPluginStorageExtension {
  setStorageItem(key: string, value: string): void;
  removeStorageItem(key: string): void;
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
export interface SetStorageProps {
  data: Record<string, string>;
}

export interface ExtendedAcrolinxSidebar extends AcrolinxSidebar {
  setStorage(props: SetStorageProps): void;
}

export interface AcrolinxSidebarWithReuse extends AcrolinxSidebar {
  liveSearch(query: string): void;
}
