import * as utils from "./utils";
import {ErrorFirstCallback} from "../../utils";
import {FORCE_SIDEBAR_URL, FALLBACK_SIDEBAR_URL} from "../../constants";

export class SidebarURLInvalidError extends Error {
  public details: string;

  constructor(public message: string, public configuredSidebarURL: string, public htmlLoaded: string) {
    super(message);
    this.configuredSidebarURL = configuredSidebarURL;
    this.htmlLoaded = htmlLoaded;
    this.details = message + "\n" +
      "Configured SidebarURL:" + configuredSidebarURL + "\n" +
      htmlLoaded;
  }
}

export interface  LoadSidebarProps {
  sidebarUrl?: string
  useMessageAdapter?: boolean
}


export function getSidebarVersion(sidebarHtml: string): [number, number, number] | null {
  const match = sidebarHtml.match(/<meta name=\"sidebar-version\" content=\"(\d+)\.(\d+)\.(\d+)/);
  if (!match || match.length != 4) {
    return null;
  }
  const versionParts = match.slice(1, 4).map(s => parseInt(s));
  return [versionParts[0], versionParts[1], versionParts[2]];
}

export function loadSidebarIntoIFrame(config: LoadSidebarProps, sidebarIFrameElement: HTMLIFrameElement, onSidebarLoaded: ErrorFirstCallback<void>, retry = true) {
  console.log('loadSidebarIntoIFrame', config);
  const sidebarBaseUrl = FORCE_SIDEBAR_URL || config.sidebarUrl || FALLBACK_SIDEBAR_URL;
  const completeSidebarUrl = sidebarBaseUrl + 'index.html?t=' + Date.now();
  utils.fetch(completeSidebarUrl, (error, sidebarHtml) => {
    if (!sidebarHtml) {
      onSidebarLoaded(error);
      return;
    }
    if (sidebarHtml.indexOf("<meta name=\"sidebar-version\"") < 0) {
      onSidebarLoaded(new SidebarURLInvalidError("It looks like the sidebar URL was configured wrongly. " +
        "Check developer console for more information!", completeSidebarUrl, sidebarHtml));
      return;
    }

    const sidebarVersion = getSidebarVersion(sidebarHtml);
    if (!FORCE_SIDEBAR_URL && (!sidebarVersion || sidebarVersion[1] < 3 || (sidebarVersion[1] == 3 && sidebarVersion[2] < 1))) {
      if (retry) {
        console.log('Load sidebar from cloud');
        loadSidebarIntoIFrame({...config, sidebarUrl: FALLBACK_SIDEBAR_URL}, sidebarIFrameElement, onSidebarLoaded, false);
      } else {
        onSidebarLoaded(new Error("Where is my cloud sidebar?"))
      }
      return;
    }

    console.log('Loaded!');

    if (config.useMessageAdapter) {
      sidebarIFrameElement.addEventListener('load', () => {
        onSidebarLoaded();
      });
      sidebarIFrameElement.src = completeSidebarUrl + '&acrolinxUseMessageApi=true';
    } else {
      const sidebarContentWindow = sidebarIFrameElement.contentWindow;
      const sidebarHtmlWithAbsoluteLinks = sidebarHtml
        .replace(/src="/g, 'src="' + sidebarBaseUrl)
        .replace(/href="/g, 'href="' + sidebarBaseUrl);
      sidebarContentWindow.document.open();
      sidebarContentWindow.document.write(sidebarHtmlWithAbsoluteLinks);
      sidebarContentWindow.document.close();
      onSidebarLoaded();
    }

  });
}

