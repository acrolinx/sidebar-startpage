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
import { sanitizeAndValidateServerAddress } from '../../src/utils/validation';
import { err, ok } from '../../src/utils/result';
import { getTranslation } from '../../src/localization';
import { SanitizeOpts } from '../../src/utils/utils';
import { describe, it } from 'vitest';

const assertDeepEqual = assert.deepEqual;

describe('validate-server-address', () => {
  describe('https is not required', () => {
    const opts = {
      windowLocation: {
        protocol: 'http:',
        hostname: 'windowhost',
      },
    };

    it('http server default port', () => {
      const expectedSanitizedServerAddress = ok('http://integration2.acrolinx.com:8031');
      assertDeepEqual(
        sanitizeAndValidateServerAddress('http://integration2.acrolinx.com:8031', opts),
        expectedSanitizedServerAddress,
      );
      assertDeepEqual(
        sanitizeAndValidateServerAddress('http://integration2.acrolinx.com', opts),
        expectedSanitizedServerAddress,
      );
      assertDeepEqual(
        sanitizeAndValidateServerAddress('integration2.acrolinx.com:8031', opts),
        expectedSanitizedServerAddress,
      );
      assertDeepEqual(
        sanitizeAndValidateServerAddress('integration2.acrolinx.com', opts),
        expectedSanitizedServerAddress,
      );
    });

    it('https server default port', () => {
      const expectedSanitizedServerAddress = ok('https://integration2.acrolinx.com:443');
      assertDeepEqual(
        sanitizeAndValidateServerAddress('https://integration2.acrolinx.com:443', opts),
        expectedSanitizedServerAddress,
      );
      assertDeepEqual(
        sanitizeAndValidateServerAddress('https://integration2.acrolinx.com', opts),
        ok('https://integration2.acrolinx.com'),
      );
      assertDeepEqual(
        sanitizeAndValidateServerAddress('integration2.acrolinx.com:443', opts),
        expectedSanitizedServerAddress,
      );
    });

    it('http server custom port', () => {
      assertDeepEqual(
        sanitizeAndValidateServerAddress('http://integration2.acrolinx.com:555', opts),
        ok('http://integration2.acrolinx.com:555'),
      );
      assertDeepEqual(
        sanitizeAndValidateServerAddress('http://integration2.acrolinx.com:443', opts),
        ok('http://integration2.acrolinx.com:443'),
      );
    });

    it('https server custom port', () => {
      assertDeepEqual(
        sanitizeAndValidateServerAddress('https://integration2.acrolinx.com:555', opts),
        ok('https://integration2.acrolinx.com:555'),
      );
    });

    it('funny domain names', () => {
      assertDeepEqual(sanitizeAndValidateServerAddress('https://localhost', opts), ok('https://localhost'));
      assertDeepEqual(sanitizeAndValidateServerAddress('https://über.daß', opts), ok('https://über.daß'));
      assertDeepEqual(sanitizeAndValidateServerAddress('https://日語書寫系統', opts), ok('https://日語書寫系統'));
    });

    it('proxy path on http host', () => {
      assertDeepEqual(sanitizeAndValidateServerAddress('/proxy', opts), ok('http://windowhost/proxy'));
      assertDeepEqual(sanitizeAndValidateServerAddress('/proxy/path', opts), ok('http://windowhost/proxy/path'));
    });

    it('proxy path on http with port', () => {
      assertDeepEqual(
        sanitizeAndValidateServerAddress('/proxy', {
          windowLocation: {
            protocol: 'http:',
            hostname: 'windowhost',
            port: '3000',
          },
        }),
        ok('http://windowhost:3000/proxy'),
      );
    });

    it('full proxy path', () => {
      assertDeepEqual(sanitizeAndValidateServerAddress('http://aem.com/proxy', opts), ok('http://aem.com/proxy'));
    });
  });

  describe('https is required', () => {
    const opts: SanitizeOpts = {
      enforceHTTPS: true,
      windowLocation: {
        protocol: 'https:',
        hostname: 'windowhost',
      },
    };

    it('http server default port', () => {
      const expectedError = err(getTranslation().serverSelector.message.serverIsNotSecure);
      assertDeepEqual(sanitizeAndValidateServerAddress('http://integration2.acrolinx.com:8031', opts), expectedError);
      assertDeepEqual(sanitizeAndValidateServerAddress('http://integration2.acrolinx.com', opts), expectedError);
      assertDeepEqual(
        sanitizeAndValidateServerAddress('integration2.acrolinx.com:8031', opts),
        ok('https://integration2.acrolinx.com:8031'),
      );
      assertDeepEqual(
        sanitizeAndValidateServerAddress('integration2.acrolinx.com', opts),
        ok('https://integration2.acrolinx.com'),
      );
    });

    it('https server default port', () => {
      const expectedSanitizedServerAddress = ok('https://integration2.acrolinx.com:443');
      assertDeepEqual(
        sanitizeAndValidateServerAddress('https://integration2.acrolinx.com:443', opts),
        expectedSanitizedServerAddress,
      );
      assertDeepEqual(
        sanitizeAndValidateServerAddress('https://integration2.acrolinx.com', opts),
        ok('https://integration2.acrolinx.com'),
      );
      assertDeepEqual(
        sanitizeAndValidateServerAddress('integration2.acrolinx.com:443', opts),
        expectedSanitizedServerAddress,
      );
    });

    it('http server custom port', () => {
      assertDeepEqual(
        sanitizeAndValidateServerAddress('http://integration2.acrolinx.com:555', opts),
        err(getTranslation().serverSelector.message.serverIsNotSecure),
      );
    });

    it('https server custom port', () => {
      assertDeepEqual(
        sanitizeAndValidateServerAddress('https://integration2.acrolinx.com:555', opts),
        ok('https://integration2.acrolinx.com:555'),
      );
    });

    it('proxy path on https host', () => {
      assertDeepEqual(sanitizeAndValidateServerAddress('/proxy', opts), ok('https://windowhost/proxy'));
      assertDeepEqual(sanitizeAndValidateServerAddress('/proxy/path', opts), ok('https://windowhost/proxy/path'));
    });

    it('proxy path on http', () => {
      assertDeepEqual(
        sanitizeAndValidateServerAddress('/proxy', {
          enforceHTTPS: true,
          windowLocation: {
            protocol: 'http:',
            hostname: 'windowhost',
          },
        }),
        err(getTranslation().serverSelector.message.serverIsNotSecure),
      );
    });

    it('full proxy path', () => {
      assertDeepEqual(sanitizeAndValidateServerAddress('https://aem.com/proxy', opts), ok('https://aem.com/proxy'));
      assertDeepEqual(
        sanitizeAndValidateServerAddress('http://aem.com/proxy', opts),
        err(getTranslation().serverSelector.message.serverIsNotSecure),
      );
    });
  });

  describe('invalid', () => {
    const opts = {
      windowLocation: {
        protocol: 'http:',
        hostname: 'windowhost',
        port: '3000',
      },
    };

    it('invalid urls', () => {
      const expectedError = err(getTranslation().serverSelector.message.invalidServerAddress);
      assertDeepEqual(sanitizeAndValidateServerAddress('crazy!!', opts), expectedError);
      assertDeepEqual(sanitizeAndValidateServerAddress('doubleport:123:13', opts), expectedError);
      assertDeepEqual(sanitizeAndValidateServerAddress('file://bla', opts), expectedError);
      assertDeepEqual(sanitizeAndValidateServerAddress('C:/bla', opts), expectedError);
    });
  });

  describe('on filesystem', () => {
    const opts = {
      windowLocation: {
        protocol: 'file:',
        hostname: '',
      },
    };

    it('proxy on file system', () => {
      const expectedError = err(getTranslation().serverSelector.message.invalidServerAddress);
      assertDeepEqual(sanitizeAndValidateServerAddress('/proxy', opts), expectedError);
    });
  });
});
