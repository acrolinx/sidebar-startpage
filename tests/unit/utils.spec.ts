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
import { isCorsWithCredentialsNeeded } from '../../src/acrolinx-sidebar-integration/utils/utils';
import { combinePathParts, isVersionGreaterEqual, parseVersionNumberWithFallback } from '../../src/utils/utils';
import { describe, it } from 'vitest';

describe('utils', () => {
  describe('isVersionGreaterEqual', function () {
    function assertVersionGreaterEqual(version: number[], minimumVersion: number[], expected: boolean) {
      assert.equal(
        isVersionGreaterEqual(version, minimumVersion),
        expected,
        `${version} >= ${minimumVersion} should be ${expected}`,
      );
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

        assertVersionGreaterEqual(
          minimumVersion.map((x, i) => x + delta[i]),
          minimumVersion,
          true,
        );

        if (delta.some(x => x != 0)) {
          assertVersionGreaterEqual(
            minimumVersion.map((x, i) => x - delta[i]),
            minimumVersion,
            false,
          );
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
      assert.deepEqual(parseVersionNumberWithFallback('15.12.0')[0], 15);
    });

    it('invalid versions return fallback', () => {
      assert.deepEqual(parseVersionNumberWithFallback('ab'), []);
      assert.deepEqual(parseVersionNumberWithFallback('12ab'), []);
      assert.deepEqual(parseVersionNumberWithFallback('12.ab'), []);
      assert.deepEqual(parseVersionNumberWithFallback('12..'), []);
    });
  });

  describe('isCorsWithCredentialsNeeded', () => {
    it('matches gcpnode.com', () => {
      assert.equal(isCorsWithCredentialsNeeded('https://sub.gcpnode.com:1234'), true);
    });
    it('matches corp.google.com', () => {
      assert.equal(isCorsWithCredentialsNeeded('https://sub.corp.google.com:1234'), true);
    });
    it('matches corp.goog', () => {
      assert.equal(isCorsWithCredentialsNeeded('https://sub.corp.goog:1234'), true);
    });
    it('does not match other stuff', () => {
      assert.equal(isCorsWithCredentialsNeeded('https://www.google.com:1234'), false);
      assert.equal(isCorsWithCredentialsNeeded('https://www.google.com'), false);
      assert.equal(isCorsWithCredentialsNeeded('https://google.com'), false);
    });
  });

  it('combinePathParts ', () => {
    assert.equal(combinePathParts('http://bla', 'path/more'), 'http://bla/path/more');
    assert.equal(combinePathParts('http://bla/', 'path/more'), 'http://bla/path/more');
    assert.equal(combinePathParts('http://bla', '/path/more'), 'http://bla/path/more');
    assert.equal(combinePathParts('http://bla/', '/path/more'), 'http://bla/path/more');
  });
});
