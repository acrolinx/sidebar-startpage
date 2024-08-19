/*
 * Copyright 2017-present Acrolinx GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { assert } from 'chai';
import $ from 'jquery';
import { SinonSandbox, SinonStub } from 'sinon';
import * as sinon from 'sinon';
import { MainControllerOpts, startMainController } from '../../../src/main-controller';
import {
  AcrolinxPlugin,
  AcrolinxSidebar,
  CheckResult,
  InitParameters,
  InitResult,
  Match,
  MatchWithReplacement,
  SoftwareComponent,
  SoftwareComponentCategory,
} from '@acrolinx/sidebar-interface';
import { assertExistCount, getExistingElement, simulateClick, waitUntilSuccess } from './test-utils/test-utils';
import { POLL_FOR_PLUGIN_INTERVAL_MS } from '../../../src/proxies/proxy-acrolinx-plugin';
import { getTranslation } from '../../../src/localization';
import { startsWith } from '../../../src/utils/utils';
import { getAcrolinxSimpleStorage } from '../../../src/utils/acrolinx-storage';
// import {HELP_LINK_URLS} from "../../../src/components/help-link";
import { ExternalLinks, getExternalLinks } from '../../../src/utils/externalLinks';
import { describe, it, beforeEach, afterEach } from 'vitest';
import '../test-styles.css';
import '../../../src/styles/index.less';
import '../../../src/assets/styles/fonts.css';

type AugmentedWindow = Window & {
  acrolinxSidebar: AcrolinxSidebar;
  acrolinxPlugin: MockedAcrolinxPlugin;
};

interface MockedAcrolinxPlugin extends AcrolinxPlugin {
  openLogFileSpy: sinon.SinonSpy;
  openWindowSpy: sinon.SinonSpy;
}

describe('integration-tests', function () {
  const augmentedWindow = window as unknown as AugmentedWindow;
  let sinonSandbox: SinonSandbox;
  let windowOpenStub: SinonStub;
  let clock: sinon.SinonFakeTimers;

  beforeEach(() => {
    sinonSandbox = sinon.createSandbox();
    clock = sinonSandbox.useFakeTimers();
    windowOpenStub = sinonSandbox.stub(window, 'open');
    getAcrolinxSimpleStorage().clear();
    $('#app').remove();
    $('body').append('<div id="app">Loading</div>');
  });

  afterEach(() => {
    sinonSandbox.restore();
  });

  function wait(ms: number) {
    clock.tick(ms);
  }

  function init(initParameters: InitParameters, mainControllerOpts: MainControllerOpts = {}) {
    const openLogFile = sinon.spy();
    const openWindow = sinon.spy();

    augmentedWindow.acrolinxPlugin = {
      openLogFileSpy: openLogFile,
      openWindowSpy: openWindow,

      requestInit() {
        augmentedWindow.acrolinxSidebar.init(initParameters);
      },

      onInitFinished(_finishResult: InitResult) {},

      requestGlobalCheck() {},

      onCheckResult(_checkResult: CheckResult) {},

      selectRanges(_checkId: string, _matches: Match[]) {},

      replaceRanges(_checkId: string, _matchesWithReplacements: MatchWithReplacement[]) {},

      openWindow,
      openLogFile,

      log() {},
    };
    startMainController(mainControllerOpts);
    wait(POLL_FOR_PLUGIN_INTERVAL_MS);
  }

  it('Injects windowAny.acrolinxSidebar', () => {
    startMainController();
    assert.isObject(augmentedWindow.acrolinxSidebar);
  });

  it('shows showServerSelector after init if requested', () => {
    init({ showServerSelector: true });
    assertExistCount('.submitButton', 1);
  });

  function assertMainErrorMessage(messageHtml: string) {
    assert.equal($('.errorMessageMain').html(), $('<div/>').html(messageHtml).html());
  }

  describe('showServerSelector = false', () => {
    it('display connection problems on own page', async () => {
      init({
        showServerSelector: false,
        serverAddress: 'http://not-existing-local-domain',
      });
      clock.restore();
      await waitUntilSuccess(() => {
        assertMainErrorMessage(getTranslation().serverSelector.message.serverConnectionProblemHttp);
      }, 4000);
    });
  });

  describe('server selector form', () => {
    const validMockedServerAddress = '/tests/browser-tests/dummy-sidebar';

    it('validate server address for invalid URLS', () => {
      init({ showServerSelector: true });

      $('.serverAddress').val('!');
      simulateClick('.submitButton');

      assertMainErrorMessage(getTranslation().serverSelector.message.invalidServerAddress);
    });

    it('display connection problems', async () => {
      init({ showServerSelector: true });

      $('.serverAddress').val('http://not-existing-local-domain');
      simulateClick('.submitButton');

      clock.restore();
      await waitUntilSuccess(() => {
        assertMainErrorMessage(getTranslation().serverSelector.message.serverConnectionProblemHttp);
      }, 4000);
    });

    it('show error message for outdated sidebar/server', async () => {
      init({ showServerSelector: true, minimumSidebarVersion: '16' });

      $('.serverAddress').val(validMockedServerAddress);
      simulateClick('.submitButton');

      clock.restore();
      await waitUntilSuccess(() => {
        assertMainErrorMessage(getTranslation().serverSelector.message.outdatedServer);
      }, 4000);
    });

    it('show error message for outdated sidebar/server when sidebar is v15.13.0', async () => {
      init({ showServerSelector: true, minimumSidebarVersion: '15.13.0' });

      $('.serverAddress').val(validMockedServerAddress);
      simulateClick('.submitButton');

      clock.restore();
      await waitUntilSuccess(() => {
        assertMainErrorMessage(getTranslation().serverSelector.message.outdatedServer);
      }, 4000);
    });

    it('load dummy sidebar', async () => {
      init({ showServerSelector: true });

      $('.serverAddress').val(validMockedServerAddress);
      simulateClick('.submitButton');

      clock.restore();

      await waitUntilSuccess(() => {
        const sidebarVersion = '<meta name="sidebar-version" content="15.12.2">';
        const sidebarIFrame = getExistingElement('#sidebarContainer iframe').get(0) as HTMLIFrameElement;
        assert.isTrue(sidebarIFrame.contentWindow!.document.head.innerHTML.includes(sidebarVersion));
        assert.equal(sidebarIFrame.contentWindow!.document.body.innerText.trim(), 'Dummy Sidebar');
      }, 4000);
    });

    it('load dummy sidebar when v14', async () => {
      init({ showServerSelector: true, minimumSidebarVersion: '14' });

      $('.serverAddress').val(validMockedServerAddress);
      simulateClick('.submitButton');

      clock.restore();

      await waitUntilSuccess(() => {
        const sidebarIFrame = getExistingElement('#sidebarContainer iframe').get(0) as HTMLIFrameElement;
        assert.equal(sidebarIFrame.contentWindow!.document.body.innerText.trim(), 'Dummy Sidebar');
      }, 4000);
    });

    it('load dummy sidebar when v15.12.0', async () => {
      init({ showServerSelector: true, minimumSidebarVersion: '15.12.0' });

      $('.serverAddress').val(validMockedServerAddress);
      simulateClick('.submitButton');

      clock.restore();

      await waitUntilSuccess(() => {
        const sidebarIFrame = getExistingElement('#sidebarContainer iframe').get(0) as HTMLIFrameElement;
        assert.equal(sidebarIFrame.contentWindow!.document.body.innerText.trim(), 'Dummy Sidebar');
      }, 4000);
    });

    it('load dummy sidebar when v15.11.1', async () => {
      init({ showServerSelector: true, minimumSidebarVersion: '15.11.1' });

      $('.serverAddress').val(validMockedServerAddress);
      simulateClick('.submitButton');

      clock.restore();

      await waitUntilSuccess(() => {
        const sidebarIFrame = getExistingElement('#sidebarContainer iframe').get(0) as HTMLIFrameElement;
        assert.equal(sidebarIFrame.contentWindow!.document.body.innerText.trim(), 'Dummy Sidebar');
      }, 4000);
    });

    it('show error message if sidebar loads to slowly', async () => {
      init({ showServerSelector: true }, { requestInitTimeOutMs: 50 });

      $('.serverAddress').val(validMockedServerAddress);
      simulateClick('.submitButton');

      clock.restore();
      await waitUntilSuccess(() => {
        assertMainErrorMessage(getTranslation().serverSelector.message.loadSidebarTimeout);
      }, 4000);
    });
  });

  describe('about page', () => {
    const openLogFileButtonSelector = 'button:contains("Open Log File")';
    const pluginClientComponent: SoftwareComponent = {
      id: 'dummyId',
      version: '1.2.3.4',
      name: 'dummyName',
      category: SoftwareComponentCategory.MAIN,
    };

    it('shows client components', () => {
      init({
        showServerSelector: true,
        clientComponents: [pluginClientComponent],
      });
      simulateClick('a:contains("About Acrolinx")');

      const aboutItems = $('.about-item');
      assert.equal(aboutItems.length, 4); // pluginClientComponent + Server Selector Version + Cors Origin
      assert.equal($('.about-tab-label', aboutItems.get(0)).text(), pluginClientComponent.name);
      assert.equal($('.about-tab-value', aboutItems.get(0)).text(), pluginClientComponent.version);

      // do not
      assertExistCount(openLogFileButtonSelector, 0);
    });

    it('do not show openLogFile if not requested', () => {
      init({
        showServerSelector: true,
        clientComponents: [pluginClientComponent],
      });
      simulateClick('a:contains("About Acrolinx")');
      assertExistCount(openLogFileButtonSelector, 0);
    });

    describe('plugin has provided a logFileLocation', () => {
      const DUMMY_LOG_FILE_LOCATION = 'dummyLogFileLocation';

      beforeEach(() => {
        init({
          showServerSelector: true,
          logFileLocation: DUMMY_LOG_FILE_LOCATION,
        });
        simulateClick('a:contains("About Acrolinx")');
      });

      it('open log file', () => {
        simulateClick(openLogFileButtonSelector);
        assert.equal(augmentedWindow.acrolinxPlugin.openLogFileSpy.callCount, 1);
      });

      it('display logFileLocation as about item', () => {
        const logFileLocationAboutItem = getExistingElement(`.about-item:contains("${DUMMY_LOG_FILE_LOCATION}")`).get(
          0,
        );
        assert.equal(
          $('.about-tab-label', logFileLocationAboutItem).text(),
          getTranslation().serverSelector.aboutItems.logFileLocation,
        );
        assert.equal($('.about-tab-value', logFileLocationAboutItem).text(), DUMMY_LOG_FILE_LOCATION);
      });
    });
  });

  describe('help', () => {
    const HELP_ICON_SELECTOR = '.icon-help';

    function assertHelpOpened(expectedUrl: string, selector = HELP_ICON_SELECTOR) {
      simulateClick(selector);
      assert.equal(augmentedWindow.acrolinxPlugin.openWindowSpy.callCount, 1);
      assert.deepEqual(augmentedWindow.acrolinxPlugin.openWindowSpy.args[0][0].url, expectedUrl);
    }

    it('click help', () => {
      init({
        showServerSelector: true,
        logFileLocation: 'dummyLogFileLocation',
      });
      const externalLinks: ExternalLinks = getExternalLinks('en');
      assertHelpOpened(externalLinks.helpLinkUrl);
    });

    it('uses window.open if initParameters.openWindowDirectly == true', () => {
      init({ openWindowDirectly: true, showServerSelector: true });
      const externalLinks: ExternalLinks = getExternalLinks('en');
      simulateClick(HELP_ICON_SELECTOR);

      sinon.assert.callCount(windowOpenStub, 1);
      sinon.assert.calledWith(windowOpenStub, externalLinks.helpLinkUrl);
      sinon.assert.notCalled(augmentedWindow.acrolinxPlugin.openWindowSpy);
    });

    it('click help provided from plugin', () => {
      const helpUrl = 'https://www.acrolinx.com';
      init({
        showServerSelector: true,
        logFileLocation: 'dummyLogFileLocation',
        helpUrl,
      });
      assertHelpOpened(helpUrl);
    });

    it('click german help', () => {
      init({
        showServerSelector: true,
        logFileLocation: 'dummyLogFileLocation',
        clientLocale: 'de-DE',
      });
      const externalLinks: ExternalLinks = getExternalLinks('de');
      assertHelpOpened(externalLinks.helpLinkUrl);
    });

    it('click english cant-connect-help', () => {
      init({ showServerSelector: true, clientLocale: 'en' });
      const externalLinkEn: ExternalLinks = getExternalLinks('en');
      assertHelpOpened(externalLinkEn.cantConnectHelpLink, '.buttonGroup .externalTextLink');
    });

    it('click german cant-connect-help', () => {
      init({ showServerSelector: true, clientLocale: 'de' });
      const externalLinkDe: ExternalLinks = getExternalLinks('de');
      assertHelpOpened(externalLinkDe.cantConnectHelpLink, '.buttonGroup .externalTextLink');
    });

    it('click english submit a request', () => {
      init({ showServerSelector: true, clientLocale: 'en' });
      const externalLinkEn: ExternalLinks = getExternalLinks('en');
      assertHelpOpened(externalLinkEn.submitRequestUrl, '.submitRequest .externalTextLink');
    });

    it('click german submit a request', () => {
      init({ showServerSelector: true, clientLocale: 'de' });
      const externalLinkDe: ExternalLinks = getExternalLinks('de');
      assertHelpOpened(externalLinkDe.submitRequestUrl, '.submitRequest .externalTextLink');
    });
  });
});
