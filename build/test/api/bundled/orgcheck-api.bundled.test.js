import { API } from '../../../dist/orgcheck/orgcheck-api';

class JsForceConnectionMock {
}

const JsForceMock = {
  Connection: JsForceConnectionMock
}

const EncoderMock = {
  encode: (t) => { return t; },
  decode: (t) => { return t; }
}

const CompressionMock = {
  zlibSync: (t) => { return t; },
  unzlibSync: (t) => { return t; }
}

const LoggerMock = {
  log: (section, message) => { console.log('LOG', section, message); },
  ended: (section, message) => { console.log('ENDED', section, message); },
  failed: (section, error) => { console.error('FAILED', section, error); }
}

describe('tests.api.bundled.API', () => {
  describe('Test API once it has been bundled', () => {

    const api = new API(JsForceMock, EncoderMock, CompressionMock, 'ACCESS_TOKEN', 'USER_ID', LoggerMock);
    
    it('Api should be instantiable', () => {
      expect(api).not.toBeNull();
    });    
  });
});