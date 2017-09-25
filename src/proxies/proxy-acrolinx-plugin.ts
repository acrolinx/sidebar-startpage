import {
  AcrolinxPlugin,
  InitResult,
  AcrolinxPluginConfiguration,
  CheckResult,
  MatchWithReplacement,
  DownloadInfo,
  OpenWindowParameters, RequestGlobalCheckOptions,
} from "../acrolinx-sidebar-integration/acrolinx-libs/plugin-interfaces";

export const POLL_FOR_PLUGIN_INTERVAL_MS = 10;

export interface ProxyAcrolinxPluginProps {
  requestInitListener: () => void;
  acrolinxPlugin: AcrolinxPlugin;
  serverAddress: string;
  showServerSelector: Function;
}

export class ProxyAcrolinxPlugin implements AcrolinxPlugin {

  constructor(private props: ProxyAcrolinxPluginProps) {
  }

  requestInit() {
    this.props.requestInitListener();
  }

  onInitFinished(initFinishedResult: InitResult) {
    this.props.acrolinxPlugin.onInitFinished(initFinishedResult);
  }

  configure(configuration: AcrolinxPluginConfiguration) {
    this.props.acrolinxPlugin.configure(configuration);
  }

  requestGlobalCheck(options?: RequestGlobalCheckOptions) {
    if (options) {
      this.props.acrolinxPlugin.requestGlobalCheck(options);
    } else {
      this.props.acrolinxPlugin.requestGlobalCheck();
    }
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

  openLogFile() {
    if (this.props.acrolinxPlugin.openLogFile) {
      this.props.acrolinxPlugin.openLogFile();
    } else {
      console.error('openLogFile is not supported');
    }
  }
}


export function waitForAcrolinxPlugin(callback: (acrolinxPlugin: AcrolinxPlugin) => void) {
  const windowAny = window as any;
  if (windowAny.acrolinxPlugin) {
    callback(windowAny.acrolinxPlugin);
  } else {
    setTimeout(() => {
      waitForAcrolinxPlugin(callback);
    }, POLL_FOR_PLUGIN_INTERVAL_MS);
  }
}
