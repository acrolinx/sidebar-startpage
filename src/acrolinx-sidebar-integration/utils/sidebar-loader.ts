import * as utils from "./utils";
import {ErrorFirstCallback} from "../../utils";

export const SIDEBAR_URL = 'http://s3-eu-west-1.amazonaws.com/acrolinx-sidebar-classic/v14.3/dev/';

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

interface  AcrolinxPluginConfig {
  sidebarUrl?: string
}


export function getSidebarVersion(sidebarHtml: string): [number, number, number] | null {
  const match = sidebarHtml.match(/<meta name=\"sidebar-version\" content=\"(\d+)\.(\d+)\.(\d+)/);
  if (!match || match.length != 4) {
    return null;
  }
  const versionParts = match.slice(1, 4).map(s => parseInt(s));
  return [versionParts[0], versionParts[1], versionParts[2]];
}

export function loadSidebarIntoIFrame(config: AcrolinxPluginConfig, sidebarIFrameElement: HTMLIFrameElement, onSidebarLoaded: ErrorFirstCallback<void>, retry = true) {
  console.log('loadSidebarIntoIFrame', config);
  const sidebarBaseUrl = config.sidebarUrl || SIDEBAR_URL;
  const completeSidebarUrl = sidebarBaseUrl + 'index.html?t=' + Date.now();
  utils.fetch(completeSidebarUrl, (error, sidebarHtml) => {
    if (!sidebarHtml) {
      onSidebarLoaded(error);
      return;
    }
    const sidebarContentWindow = sidebarIFrameElement.contentWindow;
    if (sidebarHtml.indexOf("<meta name=\"sidebar-version\"") < 0) {
      onSidebarLoaded(new SidebarURLInvalidError("It looks like the sidebar URL was configured wrongly. " +
        "Check developer console for more information!", completeSidebarUrl, sidebarHtml));
      return;
    }

    const sidebarVersion = getSidebarVersion(sidebarHtml);
    if (!sidebarVersion || sidebarVersion[1] < 3 || (sidebarVersion[1] == 3 && sidebarVersion[2] < 1)) {
      if (retry) {
        console.log('Load sidebar from cloud');
        loadSidebarIntoIFrame({sidebarUrl: SIDEBAR_URL}, sidebarIFrameElement, onSidebarLoaded, false);
      } else {
        onSidebarLoaded(new Error("Where is my cloud sidebar?"))
      }
      return;
    }

    console.log('Loaded!');

    const sidebarHtmlWithAbsoluteLinks = sidebarHtml
      .replace(/src="/g, 'src="' + sidebarBaseUrl)
      .replace(/href="/g, 'href="' + sidebarBaseUrl);
    sidebarContentWindow.document.open();
    sidebarContentWindow.document.write(sidebarHtmlWithAbsoluteLinks);
    sidebarContentWindow.document.close();
    onSidebarLoaded();
  });
}

