import {
  AcrolinxPlugin, InitResult,
  AcrolinxPluginConfiguration, CheckResult, MatchWithReplacement, DownloadInfo, OpenWindowParameters
} from "./acrolinx-sidebar-integration/acrolinx-libs/plugin-interfaces";
import {ProxyAcrolinxSidebar} from "./proxy-acrolinx-sidebar";


export class ProxyAcrolinxPlugin implements AcrolinxPlugin {
  constructor(private window: Window, private sidebarWindow: Window, private acrolinxPlugin: AcrolinxPlugin, private serverAddress: string) {
  }

  requestInit() {
    const windowAny = this.window as any;
    const sidebarWindowAny = this.sidebarWindow as any;
    windowAny.acrolinxSidebar = new ProxyAcrolinxSidebar(sidebarWindowAny.acrolinxSidebar, this.serverAddress);
    this.acrolinxPlugin.requestInit();
  }

  onInitFinished(initFinishedResult: InitResult) {
    this.acrolinxPlugin.onInitFinished(initFinishedResult);
  }

  configure(configuration: AcrolinxPluginConfiguration) {
    this.acrolinxPlugin.configure(configuration);
  }

  requestGlobalCheck() {
    this.acrolinxPlugin.requestGlobalCheck();
  }

  onCheckResult(checkResult: CheckResult) {
    this.acrolinxPlugin.onCheckResult(checkResult);
  }

  selectRanges(checkId: string, matches: MatchWithReplacement[]) {
    this.acrolinxPlugin.selectRanges(checkId, matches);
  }

  replaceRanges(checkId: string, matchesWithReplacement: MatchWithReplacement[]) {
    this.acrolinxPlugin.replaceRanges(checkId, matchesWithReplacement);
  }

  download(download: DownloadInfo) {
    this.acrolinxPlugin.download(download);
  }

  openWindow(opts: OpenWindowParameters) {
    this.acrolinxPlugin.openWindow(opts);
  }
}


export function waitForAcrolinxPlugin(callback: (acrolinxPlugin: AcrolinxPlugin) => void) {
  const windowAny = window as any;
  if (windowAny.acrolinxPlugin) {
    callback(windowAny.acrolinxPlugin);
  } else {
    setTimeout(() => {
      waitForAcrolinxPlugin(callback);
    }, 1000);
  }
}
