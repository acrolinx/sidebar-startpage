import {assert} from "chai";
import * as $ from "jquery";
import * as sinon from "sinon";
import {startMainController} from "../../../src/main-controller";
import {
  AcrolinxSidebar, AcrolinxPlugin,
  InitParameters, InitResult, AcrolinxPluginConfiguration, Match, DownloadInfo, CheckResult, OpenWindowParameters,
  MatchWithReplacement, SoftwareComponent, SoftwareComponentCategory
} from "../../../src/acrolinx-sidebar-integration/acrolinx-libs/plugin-interfaces";
import {assertExistCount, simulateClick} from "./test-utils/test-utils";
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
    startMainController();
    wait(POLL_FOR_PLUGIN_INTERVAL_MS);
  };


  it('Injects windowAny.acrolinxSidebar', () => {
    startMainController();
    assert.isObject(augmentedWindow.acrolinxSidebar);
  });

  it('shows showServerSelector after init if requested', () => {
    init({showServerSelector: true});
    assertExistCount('.submitButton', 1);
  });

  describe('about page', () => {
    it('shows client components', () => {
      const pluginClientComponent: SoftwareComponent = {
        id: 'dummyId',
        version: '1.2.3.4',
        name: 'dummyName',
        category: SoftwareComponentCategory.MAIN
      };

      init({showServerSelector: true, clientComponents: [pluginClientComponent]});
      simulateClick('a:contains("About Acrolinx")');

      const aboutItems = $('.about-item');
      assert.equal(aboutItems.length, 3); // pluginClientComponent + Server Selector Version + Cors Origin
      assert.equal($('.about-tab-label', aboutItems.get(0)).text(), pluginClientComponent.name);
      assert.equal($('.about-tab-value', aboutItems.get(0)).text(), pluginClientComponent.version);
    });
  });


});