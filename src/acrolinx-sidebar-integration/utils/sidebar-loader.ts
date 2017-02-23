import * as utils from "./utils";
import {ErrorFirstCallback} from "../../utils";

export const SIDEBAR_URL = 'https://sidebar-classic.acrolinx-cloud.com/v14/prod/';

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

export function loadSidebarIntoIFrame(config: AcrolinxPluginConfig, sidebarIFrameElement: HTMLIFrameElement, onSidebarLoaded: ErrorFirstCallback<void>) {
  const sidebarBaseUrl = config.sidebarUrl || SIDEBAR_URL;
  const timestamp = Date.now().toString();
  const completeSidebarUrl = sidebarBaseUrl + 'index.html?t=' + timestamp;
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
    const sidebarHtmlWithAbsoluteLinks = sidebarHtml
      .replace(/src="/g, 'src="' + sidebarBaseUrl)
      .replace(/href="/g, 'href="' + sidebarBaseUrl);
    sidebarContentWindow.document.open();
    sidebarContentWindow.document.write(sidebarHtmlWithAbsoluteLinks);
    sidebarContentWindow.document.close();
    onSidebarLoaded();
  });
}

