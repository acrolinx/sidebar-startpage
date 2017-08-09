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
import {HELP_LINK_URL} from "../../../src/components/help-link";
import {getAcrolinxSimpleStorage} from "../../../src/utils/acrolinx-storage";

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
    getAcrolinxSimpleStorage().clear();
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

  function assertMainErrorMessage(messageHtml: string) {
    assert.equal($('.errorMessageMain').html(), $('<div/>').html(messageHtml).html());
  }

  describe('showServerSelector = false', () => {
    it('display connection problems on own page', (done) => {
      init({showServerSelector: false, serverAddress: 'http://not-existing-local-domain'});
      clock.restore();
      setTimeout(() => {
        assertMainErrorMessage(getTranslation().serverSelector.message.serverConnectionProblemHttp);
        done();
      }, 500);
    });
  });


  describe('server selector form', () => {
    const validMockedServerAddress = (startsWith(window.location.pathname, '/test/') ? '' : '/base') + '/test/browser-tests/dummy-sidebar';

    it('validate server address for invalid URLS', () => {
      init({showServerSelector: true});

      $('.serverAddress').val('!');
      simulateClick('.submitButton');

      assertMainErrorMessage(getTranslation().serverSelector.message.invalidServerAddress);
    });

    it('display connection problems', (done) => {
      init({showServerSelector: true});

      $('.serverAddress').val('http://not-existing-local-domain');
      simulateClick('.submitButton');

      clock.restore();
      setTimeout(() => {
        assertMainErrorMessage(getTranslation().serverSelector.message.serverConnectionProblemHttp);
        done();
      }, 500);
    });

    it('show error message for outdated sidebar/server', (done) => {
      init({showServerSelector: true, minimumSidebarVersion: '15'});

      $('.serverAddress').val(validMockedServerAddress);
      simulateClick('.submitButton');

      clock.restore();
      setTimeout(() => {
        assertMainErrorMessage(getTranslation().serverSelector.message.outdatedServer);
        done();
      }, 500);
    });

    it('load dummy sidebar', (done) => {
      init({showServerSelector: true});

      $('.serverAddress').val(validMockedServerAddress);
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
    const openLogFileButtonSelector = 'button:contains("Open Log File")';
    const pluginClientComponent: SoftwareComponent = {
      id: 'dummyId',
      version: '1.2.3.4',
      name: 'dummyName',
      category: SoftwareComponentCategory.MAIN
    };

    it('shows client components', () => {
      init({showServerSelector: true, clientComponents: [pluginClientComponent]});
      simulateClick('a:contains("About Acrolinx")');

      const aboutItems = $('.about-item');
      assert.equal(aboutItems.length, 4); // pluginClientComponent + Server Selector Version + Cors Origin
      assert.equal($('.about-tab-label', aboutItems.get(0)).text(), pluginClientComponent.name);
      assert.equal($('.about-tab-value', aboutItems.get(0)).text(), pluginClientComponent.version);

      // do not
      assertExistCount(openLogFileButtonSelector, 0);
    });

    it('do not show openLogFile if not requested', () => {
      init({showServerSelector: true, clientComponents: [pluginClientComponent]});
      simulateClick('a:contains("About Acrolinx")');
      assertExistCount(openLogFileButtonSelector, 0);
    });

    describe('plugin has provided a logFileLocation', () => {
      const DUMMY_LOG_FILE_LOCATION = 'dummyLogFileLocation';

      beforeEach(() => {
        init({showServerSelector: true, logFileLocation: DUMMY_LOG_FILE_LOCATION});
        simulateClick('a:contains("About Acrolinx")');
      });

      it('open log file', () => {
        simulateClick(openLogFileButtonSelector);
        assert.equal(augmentedWindow.acrolinxPlugin.openLogFileSpy.callCount, 1);
      });

      it('display logFileLocation as about item', () => {
        const logFileLocationAboutItem = getExistingElement(`.about-item:contains("${DUMMY_LOG_FILE_LOCATION}")`).get(0);
        assert.equal($('.about-tab-label', logFileLocationAboutItem).text(), getTranslation().serverSelector.aboutItems.logFileLocation);
        assert.equal($('.about-tab-value', logFileLocationAboutItem).text(), DUMMY_LOG_FILE_LOCATION);
      });
    });
  });

  it('click help', () => {
    init({showServerSelector: true, logFileLocation: 'dummyLogFileLocation'});
    simulateClick('.icon-help');
    assert.equal(augmentedWindow.acrolinxPlugin.openWindowSpy.callCount, 1);
    assert.deepEqual(augmentedWindow.acrolinxPlugin.openWindowSpy.args[0][0], {url: HELP_LINK_URL});

  });

});