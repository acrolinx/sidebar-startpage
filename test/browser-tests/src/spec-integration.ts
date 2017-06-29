import {assert} from "chai";
import * as $ from "jquery";
import * as sinon from "sinon";
import {startMainController} from "../../../src/main-controller";
import {
  AcrolinxPlugin,
  AcrolinxPluginConfiguration,
  AcrolinxSidebar,
  CheckResult,
  DownloadInfo,
  InitParameters,
  InitResult,
  Match,
  MatchWithReplacement,
  SoftwareComponent,
  SoftwareComponentCategory
} from "../../../src/acrolinx-sidebar-integration/acrolinx-libs/plugin-interfaces";
import {assertExistCount, getExistingElement, simulateClick} from "./test-utils/test-utils";
import {POLL_FOR_PLUGIN_INTERVAL_MS} from "../../../src/proxies/proxy-acrolinx-plugin";
import {getTranslation} from "../../../src/localization";
import {startsWith} from "../../../src/utils/utils";

type AugmentedWindow = Window & {
  acrolinxSidebar: AcrolinxSidebar;
  acrolinxPlugin: MockedAcrolinxPlugin;
};

interface MockedAcrolinxPlugin extends AcrolinxPlugin {
  openLogFileSpy: sinon.SinonSpy;
  openWindowSpy: sinon.SinonSpy;
}

describe('integration-tests', () => {
  const augmentedWindow = window as AugmentedWindow;
  let clock: sinon.SinonFakeTimers;

  beforeEach(() => {
    clock = sinon.useFakeTimers();
    localStorage.clear();
    $('#app').remove();
    $('body').append('<div id="app">Loading</div>');
  });

  afterEach(() => {
    clock.restore();
  });

  function wait(ms: number) {
    clock.tick(ms);
  }

  function init(initParameters: InitParameters) {
    const openLogFile = sinon.spy();
    const openWindow = sinon.spy();

    augmentedWindow.acrolinxPlugin = {
      openLogFileSpy: openLogFile,
      openWindowSpy: openWindow,

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

      openWindow,
      openLogFile
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

  describe('server selector form', () => {
    it('validate server address for invalid URLS', () => {
      init({showServerSelector: true});

      $('.serverAddress').val('!');
      simulateClick('.submitButton');

      assert.equal($('#errorMessage').text(), getTranslation().serverSelector.message.invalidServerAddress);
    });

    it('display connection problems', (done) => {
      init({showServerSelector: true});

      $('.serverAddress').val('http://not-existing-local-domain');
      simulateClick('.submitButton');

      clock.restore();
      setTimeout(() => {
        assert.equal($('#errorMessage').text(), getTranslation().serverSelector.message.serverConnectionProblemHttp);
        done();
      }, 500);
    });

    it('load dummy sidebar', (done) => {
      init({showServerSelector: true});

      const serverAddress = (startsWith(window.location.pathname, '/test/') ? '' : '/base') + '/test/browser-tests/dummy-sidebar';
      $('.serverAddress').val(serverAddress);
      simulateClick('.submitButton');

      clock.restore();
      setTimeout(() => {
        const sidebarIFrame = getExistingElement('#sidebarContainer iframe').get(0) as HTMLIFrameElement;
        assert.equal(sidebarIFrame.contentWindow.document.body.innerText, 'Dummy Sidebar');
        done();
      }, 500);
    });
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

    describe('shoe log file path section if requried', () => {
      const DUMMY_LOG_FILE_LOCATION = 'dummyLogFileLocation';

      beforeEach(() => {
        init({showServerSelector: true, logFileLocation: DUMMY_LOG_FILE_LOCATION});
        simulateClick('a:contains("About Acrolinx")');
      });

      it('shows log path', () => {
        simulateClick('button:contains("Open Log File")');
        assert.equal(augmentedWindow.acrolinxPlugin.openLogFileSpy.callCount, 1);
        assert.equal(getExistingElement('.logfileLocationValue').text(), DUMMY_LOG_FILE_LOCATION);
      });

      it('select log path on click', () => {
        simulateClick('button:contains("Open Log File")');
        assert.equal(augmentedWindow.acrolinxPlugin.openLogFileSpy.callCount, 1);
        simulateClick('.logfileLocationValue');
        const selectedText = window.getSelection().toString();
        assert.equal(selectedText, DUMMY_LOG_FILE_LOCATION);
      });

      it('open log file', () => {
        simulateClick('button:contains("Open Log File")');
        assert.equal(augmentedWindow.acrolinxPlugin.openLogFileSpy.callCount, 1);
      });

    });


    it('click help', () => {
      init({showServerSelector: true, logFileLocation: 'dummyLogFileLocation'});
      simulateClick('a:contains("About Acrolinx")');

      simulateClick('a:contains("Need help?")');
      assert.equal(augmentedWindow.acrolinxPlugin.openWindowSpy.callCount, 1);
      assert.deepEqual(augmentedWindow.acrolinxPlugin.openWindowSpy.args[0][0], {url: 'http://www.sternenlaub.de'});

    });

  });


});