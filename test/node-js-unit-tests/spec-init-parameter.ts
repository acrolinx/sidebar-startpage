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

import {getClientComponentFallbackId, hackInitParameters, sanitizeClientComponent} from '../../src/init-parameters';
import {assert} from 'chai';
import * as _ from 'lodash';
import {assertDeepEqual} from '../browser-tests/src/test-utils/test-utils';


describe('init-parameters', () => {
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

  describe('sanitizeClientComponents', () => {
    const clientComponent = {
      id: 'clientId',
      name: 'clientName',
      version: '1.2.3.0',
      category: 'MAIN'
    };

    it('keep existing attributes', () => {
      assertDeepEqual(sanitizeClientComponent(clientComponent, 0), clientComponent);
    });

    it('use name as id fallback', () => {
      assertDeepEqual(
        sanitizeClientComponent(_.omit(clientComponent, 'id'), 0).id,
        clientComponent.name
      );
    });

    it('use index based id fallback fallback', () => {
      assertDeepEqual(
        sanitizeClientComponent(_.omit(clientComponent, 'id', 'name'), 23).id,
        'unknown.client.component.id.with.index.23'
      );
    });

    it('version fallback', () => {
      assertDeepEqual(
        sanitizeClientComponent(_.omit(clientComponent, 'version'), 0).version,
        '0.0.0.0'
      );
    });

    it('use id as name fallback', () => {
      assertDeepEqual(
        sanitizeClientComponent(_.omit(clientComponent, 'name'), 0).name,
        clientComponent.id
      );
    });
  });


  describe('getClientComponentFallbackId', () => {
    it('replace all non alphabet|number by a dot', () => {
      assert.equal(getClientComponentFallbackId('word1!WORD2', 0), 'word1.WORD2');
      assert.equal(getClientComponentFallbackId('wordÜÖ!"§$%&/()123', 0), 'word.123');
    });

    it('prevent duplicated dots', () => {
      assert.equal(getClientComponentFallbackId('word1!!WORD2', 0), 'word1.WORD2');
      assert.equal(getClientComponentFallbackId('word1.!.WORD2', 0), 'word1.WORD2');
      assert.equal(getClientComponentFallbackId('word1  more!&word2', 0), 'word1.more.word2');
    });

    it('return index id as fallback-fallback', () => {
      const expectedFallbackFallback = 'unknown.client.component.id.with.index.0';
      assert.equal(getClientComponentFallbackId(undefined, 0), expectedFallbackFallback);
      assert.equal(getClientComponentFallbackId(null, 0), expectedFallbackFallback);
      assert.equal(getClientComponentFallbackId('', 0), expectedFallbackFallback);
      assert.equal(getClientComponentFallbackId(' ', 0), expectedFallbackFallback);
      assert.equal(getClientComponentFallbackId(' ÜÖ !"§$ %& /() ', 0), expectedFallbackFallback);
    });
  });
});
