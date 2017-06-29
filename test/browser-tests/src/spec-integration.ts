import {assert} from "chai";
import * as $ from "jquery";
import * as sinon from "sinon";
import {startMainController} from "../../../src/main-controller";
import {
  AcrolinxSidebar, AcrolinxPlugin,
  InitParameters, InitResult, AcrolinxPluginConfiguration, Match, DownloadInfo, CheckResult, OpenWindowParameters,
  MatchWithReplacement
} from "../../../src/acrolinx-sidebar-integration/acrolinx-libs/plugin-interfaces";
import {assertExistCount} from "./test-utils/test-utils";
import {POLL_FOR_PLUGIN_INTERVAL_MS} from "../../../src/proxies/proxy-acrolinx-plugin";

type AugmentedWindow = Window & {
  acrolinxSidebar: AcrolinxSidebar;
  acrolinxPlugin: AcrolinxPlugin;
};


describe('integration-tests', () => {
  const augmentedWindow = window as AugmentedWindow;
  let clock: sinon.SinonFakeTimers;

  beforeEach(() => {
    clock = sinon.useFakeTimers();
    localStorage.clear();
    $('#app').remove();
    $('body').append('<div id="app">Loading</div>');
    startMainController();
  });

  afterEach(function() {
    clock.restore();
  });

  function wait(ms: number) {
    clock.tick(ms);
  }

  function init(initParameters: InitParameters) {
    augmentedWindow.acrolinxPlugin = {
      requestInit() {
        augmentedWindow.acrolinxSidebar.init(initParameters);
      },

      onInitFinished(_finishResult: InitResult) {
      },

      configure(_configuration: AcrolinxPluginConfiguration) {
      },

      requestGlobalCheck() {
      },

      onCheckResult(_checkResult: CheckResult) {
      },

      selectRanges(_checkId: string, _matches: Match[]) {
      },

      replaceRanges(_checkId: string, _matchesWithReplacements: MatchWithReplacement[]) {
      },

      download(_downloadInfo: DownloadInfo) {
      },

      openWindow(_openWindowParameters: OpenWindowParameters) {
      },

      openLogFile() {
      }

    };
  };


  it('Injects windowAny.acrolinxSidebar', () => {
    assert.isObject(augmentedWindow.acrolinxSidebar);
  });

  it('shows showServerSelector after init if requested', () => {
    init({showServerSelector: true});
    wait(POLL_FOR_PLUGIN_INTERVAL_MS);
    assertExistCount('.submitButton', 1);
  });


});