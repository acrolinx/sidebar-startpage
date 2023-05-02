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
      assert.deepEqual(getSidebarVersion('<html><meta name="sidebar-version" content="15.12.0"></html> '), [15, 12, 0] as [number, number, number]);
    });

  });
});