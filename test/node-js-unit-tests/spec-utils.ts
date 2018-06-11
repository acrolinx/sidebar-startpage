import {assert} from "chai";
import {isCorsWithCredentialsNeeded} from '../../src/acrolinx-sidebar-integration/utils/utils';
import {isVersionGreaterEqual, parseVersionNumberWithFallback} from "../../src/utils/utils";

describe('utils', () => {
  describe('isVersionGreaterEqual', () => {
    function assertVersionGreaterEqual(version: number[], minimumVersion: number[], expected: boolean) {
      assert.equal(isVersionGreaterEqual(version, minimumVersion), expected, `${version} >= ${minimumVersion} should be ${expected}`);
    }

    it('single digit', () => {
      assertVersionGreaterEqual([2], [1], true);
      assertVersionGreaterEqual([2], [2], true);
      assertVersionGreaterEqual([2], [3], false);
    });

    it('2 digits', () => {
      assertVersionGreaterEqual([2, 2], [2, 2], true);
      assertVersionGreaterEqual([2, 2], [2, 3], false);
      assertVersionGreaterEqual([2, 2], [3, 2], false);
    });

    it('3 digits', () => {
      assertVersionGreaterEqual([1, 1, 1], [1, 1, 0], true);
      assertVersionGreaterEqual([1, 1, 1], [1, 1, 1], true);
      assertVersionGreaterEqual([1, 1, 1], [1, 1, 2], false);
      assertVersionGreaterEqual([1, 1, 1], [1, 2, 1], false);
      assertVersionGreaterEqual([1, 1, 1], [2, 1, 1], false);
    });

    it('3 digits compared with 2 digits', () => {
      assertVersionGreaterEqual([2, 2, 2], [2, 2], true);
      assertVersionGreaterEqual([2, 1, 2], [2, 2], false);
    });

    it('3 digits compared with 1 digit', () => {
      assertVersionGreaterEqual([2, 2, 2], [2], true);
      assertVersionGreaterEqual([1, 1, 2], [2], false);
    });

    it('3 digits compared with 0 digit', () => {
      assertVersionGreaterEqual([2, 2, 2], [], true);
    });

    it('some fuzz testing', () => {
      function randomInt(maxValue = 100): number {
        return Math.round(Math.random() * maxValue);
      }

      for (let i = 0; i < 10000; i++) {
        const minimumVersion = [randomInt(), randomInt(), randomInt()];
        const delta = [randomInt(2), randomInt(2), randomInt(2)];

        assertVersionGreaterEqual(minimumVersion.map((x, i) => x + delta[i]), minimumVersion, true);

        if (delta.some(x => x != 0)) {
          assertVersionGreaterEqual(minimumVersion.map((x, i) => x - delta[i]), minimumVersion, false);
        }
      }
    });

  });

  describe('parseVersionNumber', () => {
    it('valid versions', () => {
      assert.deepEqual(parseVersionNumberWithFallback(''), []);
      assert.deepEqual(parseVersionNumberWithFallback('12'), [12]);
      assert.deepEqual(parseVersionNumberWithFallback('14.11.123'), [14, 11, 123]);
      assert.deepEqual(parseVersionNumberWithFallback('1.2.3'), [1, 2, 3]);
    });

    it('invalid versions return fallback', () => {
      assert.deepEqual(parseVersionNumberWithFallback('ab'), []);
      assert.deepEqual(parseVersionNumberWithFallback('12ab'), []);
      assert.deepEqual(parseVersionNumberWithFallback('12.ab'), []);
      assert.deepEqual(parseVersionNumberWithFallback('12..'), []);
    });
  });

  describe('isCorsWithCredentialsNeeded', () => {
    it('matches gcpnode', () => {
      assert.equal(isCorsWithCredentialsNeeded('https://sub.gcpnode.com:1234'), true);
    });
    it('matches corp.google', () => {
      assert.equal(isCorsWithCredentialsNeeded('https://sub.corp.google.com:1234'), true);
    });
    it('does not match other stuff', () => {
      assert.equal(isCorsWithCredentialsNeeded('https://www.google.com:1234'), false);
      assert.equal(isCorsWithCredentialsNeeded('https://www.google.com'), false);
      assert.equal(isCorsWithCredentialsNeeded('https://google.com'), false);
    });
  })

});