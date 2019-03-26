/*
 * Copyright 2019-present Acrolinx GmbH
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

import {hackInitParameters} from '../../src/init-parameters';
import {assert} from 'chai';


describe.only('init-parameters', () => {
  describe('hackInitParameters', () => {
    const DUMMY_SERVER_ADDRESS = 'http://dummyServer';
    const DUMMY_ACCESS_TOKEN = 'http://dummyServer';

    it('pass accessToken normally', () => {
      const result = hackInitParameters({accessToken: DUMMY_ACCESS_TOKEN}, DUMMY_SERVER_ADDRESS);
      assert.equal(result.accessToken, DUMMY_ACCESS_TOKEN);
    });

    it('ignore accessToken if showServerSelector===true', () => {
      const result = hackInitParameters({
        accessToken: DUMMY_ACCESS_TOKEN,
        showServerSelector: true
      }, DUMMY_SERVER_ADDRESS);
      assert.isUndefined(result.accessToken);
    });
  });
});
