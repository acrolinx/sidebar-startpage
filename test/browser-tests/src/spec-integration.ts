import {assert} from "chai";
import * as $ from "jquery";
import {startMainController} from "../../../src/main-controller";
import {AcrolinxSidebar} from "../../../src/acrolinx-sidebar-integration/acrolinx-libs/plugin-interfaces";

type WindowWithInjectedStartPage = Window & {
  acrolinxSidebar: AcrolinxSidebar;
};


describe('integration-tests', () => {
  beforeEach(() => {
    $('#app').remove();
    $('body').append('<div id="app">Loading</div>');
  });


  it('Injects windowAny.acrolinxSidebar', () => {
    startMainController();
    const windowAny = window as WindowWithInjectedStartPage;
    assert.isObject(windowAny.acrolinxSidebar);
  });
});