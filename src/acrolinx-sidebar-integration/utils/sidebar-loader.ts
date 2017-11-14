import * as utils from "./utils";
import {FetchError} from "./utils";
import {FALLBACK_SIDEBAR_URL, FORCE_SIDEBAR_URL} from "../../constants";
import {isVersionGreaterEqual} from "../../utils/utils";
import * as logging from "../../utils/logging";


export interface  LoadSidebarProps {
  sidebarUrl: string;
  useMessageAdapter: boolean;
  minimumSidebarVersion: number[];
}

export function getSidebarVersion(sidebarHtml: string): [number, number, number] | null {
  const match = sidebarHtml.match(/<meta name=\"sidebar-version\" content=\"(\d+)\.(\d+)\.(\d+)/);
  if (!match || match.length != 4) {
    return null;
  }
  const versionParts = match.slice(1, 4).map(s => parseInt(s));
  return [versionParts[0], versionParts[1], versionParts[2]];
}

function needsFallbackSidebar(sidebarVersion: [number, number, number] | null) {
  return (!sidebarVersion || sidebarVersion[1] < 3 || (sidebarVersion[1] == 3 && sidebarVersion[2] < 1));
}


type NoValidSidebarErrorCode = 'noSidebar' | 'noCloudSidebar' | 'sidebarVersionIsBelowMinimum';

export class NoValidSidebarError extends Error {
  constructor(public acrolinxErrorCode: NoValidSidebarErrorCode, message: string) {
    super(message);
  }
}

export type LoadSidebarError = FetchError | NoValidSidebarError;

export function loadSidebarIntoIFrame(config: LoadSidebarProps, sidebarIFrameElement: HTMLIFrameElement, onSidebarLoaded: (error?: LoadSidebarError) => void, retryWithCloudSidebar = false) {
  logging.log('loadSidebarIntoIFrame', config);
  const sidebarBaseUrl = retryWithCloudSidebar ? FALLBACK_SIDEBAR_URL : (FORCE_SIDEBAR_URL || config.sidebarUrl);
  const completeSidebarUrl = sidebarBaseUrl + 'index.html?t=' + Date.now();
  utils.fetch(completeSidebarUrl, {timeout: 10000}, (sidebarHtmlOrError) => {
    // Handle fetch errors.
    if (typeof sidebarHtmlOrError !== 'string') {
      if (retryWithCloudSidebar) {
        onSidebarLoaded(new NoValidSidebarError('noCloudSidebar', "Can't load cloud sidebar."));
      } else {
        const fetchError: FetchError = sidebarHtmlOrError;
        logging.error("Error while fetching the sidebar: " + fetchError.acrolinxErrorCode, fetchError);
        onSidebarLoaded(fetchError);
      }
      return;
    }

    const sidebarHtml = sidebarHtmlOrError;

    // Handle invalid sidebar html error.
    if (sidebarHtml.indexOf("<meta name=\"sidebar-version\"") < 0) {
      onSidebarLoaded(new NoValidSidebarError(retryWithCloudSidebar ? 'noCloudSidebar' : 'noSidebar', 'No valid sidebar html code:' + sidebarHtml));
      return;
    }

    const sidebarVersion = getSidebarVersion(sidebarHtml);

    if (!FORCE_SIDEBAR_URL) {
      if (!sidebarVersion || needsFallbackSidebar(sidebarVersion)) {
        if (retryWithCloudSidebar) {
          onSidebarLoaded(new NoValidSidebarError('noCloudSidebar', "The cloud sidebar has the wrong version."));
        } else {
          logging.log('Load sidebar from cloud');
          loadSidebarIntoIFrame(config, sidebarIFrameElement, onSidebarLoaded, true);
        }
        return;
      }

      if (!isVersionGreaterEqual(sidebarVersion, config.minimumSidebarVersion)) {
        logging.log('Found sidebar version', sidebarVersion, "minimumSidebarVersion was", config.minimumSidebarVersion);
        onSidebarLoaded(new NoValidSidebarError('sidebarVersionIsBelowMinimum', "Sidebar version is smaller than minimumSidebarVersion"));
        return;
      }
    }

    logging.log('Sidebar HTML is loaded successfully');

    if (config.useMessageAdapter) {
      const onLoadHandler = () => {
        sidebarIFrameElement.removeEventListener('load', onLoadHandler);
        onSidebarLoaded();
      };
      sidebarIFrameElement.addEventListener('load', onLoadHandler);
      sidebarIFrameElement.src = completeSidebarUrl + '&acrolinxUseMessageApi=true';
    } else {
      writeSidebarHtmlIntoIFrame(sidebarHtml, sidebarIFrameElement, sidebarBaseUrl);
      onSidebarLoaded();
    }
  });
}

function writeSidebarHtmlIntoIFrame(sidebarHtml: string, sidebarIFrameElement: HTMLIFrameElement, sidebarBaseUrl: string) {
  const sidebarContentWindow = sidebarIFrameElement.contentWindow;
  const sidebarHtmlWithAbsoluteLinks = sidebarHtml
    .replace(/src="/g, 'src="' + sidebarBaseUrl)
    .replace(/href="/g, 'href="' + sidebarBaseUrl);
  sidebarContentWindow.document.open();
  sidebarContentWindow.document.write(sidebarHtmlWithAbsoluteLinks);
  sidebarContentWindow.document.close();
}
