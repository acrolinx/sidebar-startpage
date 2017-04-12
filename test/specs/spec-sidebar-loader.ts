import {assert} from "chai";
import {getSidebarVersion} from "../../src/acrolinx-sidebar-integration/utils/sidebar-loader";

describe('sidebar-loader', () => {
  describe('getSidebarVersion', () => {

    it('returns null if there is no sidebar or an invalid version', () => {
      assert.equal(getSidebarVersion(''), null);
      assert.equal(getSidebarVersion('<html><body></body></html>'), null);
      assert.equal(getSidebarVersion('<html><body></body></html>'), null);
      assert.equal(getSidebarVersion('<html><head><meta name="sidebar-version" content="1"></head></html>'), null);
      assert.equal(getSidebarVersion('<html><head><meta name="sidebar-version" content="1.2"></head></html>'), null);
      assert.equal(getSidebarVersion('<html><head><meta name="sidebar-version" content="bla"></head></html>'), null);
    });

    it('returns version if there is a sidebar', () => {
      assert.deepEqual(getSidebarVersion('<html><meta name="sidebar-version" content="14.2.2"></html> '), [14, 2, 2] as [number, number, number]);
    });

  })
});