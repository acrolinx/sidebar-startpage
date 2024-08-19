import { AcrolinxPlugin, AcrolinxSidebar } from '@acrolinx/sidebar-interface';

interface AcrolinxPluginStorageExtension {
  setStorageItem(key: string, value: string): void;
  removeStorageItem(key: string): void;
}

export interface ExtendedAcrolinxPlugin extends AcrolinxPlugin, AcrolinxPluginStorageExtension {}

export interface SetStorageProps {
  data: Record<string, string>;
}

export interface ExtendedAcrolinxSidebar extends AcrolinxSidebar {
  setStorage(props: SetStorageProps): void;
}
