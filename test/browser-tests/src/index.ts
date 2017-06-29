import {assert} from "chai";
declare const require: (name: String) => any;
require('../../node-js-unit-tests/spec-sidebar-loader');
require('../../node-js-unit-tests/spec-validate-server-address');


describe('browser-tests', () => {
    it('This is just a dummy test.', () => {
      assert.equal(1, 1);
    });
});