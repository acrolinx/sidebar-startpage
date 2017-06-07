import {assert} from "chai";
import {sanitizeServerAddress, validateServerAddress} from "../../src/utils/utils";


describe('validate-server-address', () => {
  function sanitizeAndValidate(address: string, defaultProtocol = 'http:'): string | undefined {
    const sanitizedUrl = sanitizeServerAddress(address, defaultProtocol);
    return validateServerAddress(sanitizedUrl) ? sanitizedUrl : undefined;
  }


  it('http server default port', () => {
    // assert.equal(sanitizeAndValidate('integration2.acrolinx.com:8031/sidebar'), 'http://integration2.acrolinx.com:8031');
    const expectedSanitizedServerAddress = 'http://integration2.acrolinx.com:8031';
    assert.equal(sanitizeAndValidate('http://integration2.acrolinx.com:8031'), expectedSanitizedServerAddress);
    assert.equal(sanitizeAndValidate('http://integration2.acrolinx.com'), expectedSanitizedServerAddress);
    assert.equal(sanitizeAndValidate('integration2.acrolinx.com:8031'), expectedSanitizedServerAddress);
    assert.equal(sanitizeAndValidate('integration2.acrolinx.com'), expectedSanitizedServerAddress);
  });

  it('https server default port', () => {
    const expectedSanitizedServerAddress = 'https://integration2.acrolinx.com:443';
    assert.equal(sanitizeAndValidate('https://integration2.acrolinx.com:443'), expectedSanitizedServerAddress);
    assert.equal(sanitizeAndValidate('https://integration2.acrolinx.com'), 'https://integration2.acrolinx.com');
    // assert.equal(sanitizeAndValidate('integration2.acrolinx.com:443'), expectedSanitizedServerAddress);
  });

  it('https server custom port', () => {
    assert.equal(sanitizeAndValidate('https://integration2.acrolinx.com:555'), 'https://integration2.acrolinx.com:555');
  });

  it('http server custom port', () => {
    assert.equal(sanitizeAndValidate('http://integration2.acrolinx.com:555'), 'http://integration2.acrolinx.com:555');
  });


});