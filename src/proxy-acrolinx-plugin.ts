import {
  AcrolinxPlugin,
  InitResult,
  AcrolinxPluginConfiguration,
  CheckResult,
  MatchWithReplacement,
  DownloadInfo,
  OpenWindowParameters
} from "./acrolinx-sidebar-integration/acrolinx-libs/plugin-interfaces";
import {ProxyAcrolinxSidebar} from "./proxy-acrolinx-sidebar";


export interface ProxyAcrolinxPluginProps {
  window: Window;
  sidebarWindow: Window;
  acrolinxPlugin: AcrolinxPlugin;
  serverAddress: string;
  showServerSelector: Function;
}

export class ProxyAcrolinxPlugin implements AcrolinxPlugin {
  constructor(private props: ProxyAcrolinxPluginProps) {
  }

  requestInit() {
    const windowAny = this.props.window as any;
    const sidebarWindowAny = this.props.sidebarWindow as any;
    windowAny.acrolinxSidebar = new ProxyAcrolinxSidebar(sidebarWindowAny.acrolinxSidebar, this.props.serverAddress);
    this.props.acrolinxPlugin.requestInit();
  }

  onInitFinished(initFinishedResult: InitResult) {
    this.props.acrolinxPlugin.onInitFinished(initFinishedResult);
  }

  configure(configuration: AcrolinxPluginConfiguration) {
    this.props.acrolinxPlugin.configure(configuration);
  }

  requestGlobalCheck() {
    this.props.acrolinxPlugin.requestGlobalCheck();
  }

  onCheckResult(checkResult: CheckResult) {
    this.props.acrolinxPlugin.onCheckResult(checkResult);
  }

  selectRanges(checkId: string, matches: MatchWithReplacement[]) {
    this.props.acrolinxPlugin.selectRanges(checkId, matches);
  }

  replaceRanges(checkId: string, matchesWithReplacement: MatchWithReplacement[]) {
    this.props.acrolinxPlugin.replaceRanges(checkId, matchesWithReplacement);
  }

  download(download: DownloadInfo) {
    this.props.acrolinxPlugin.download(download);
  }

  openWindow(opts: OpenWindowParameters) {
    if (this.props.acrolinxPlugin.openWindow) {
      this.props.acrolinxPlugin.openWindow(opts);
    } else {
      window.open(opts.url);
    }
  }

  showServerSelector() {
    this.props.showServerSelector();
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
