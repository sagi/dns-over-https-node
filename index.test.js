const doh = require('./index');
const dnsPacket = require('dns-packet');
const { EventEmitter } = require('events');

jest.mock('http');
jest.mock('https');

describe('doh tests', () => {
  test('getDnsQuery', () => {
    const id = 0;
    const klass = 'IN';
    const name = 'sagi.io';
    const type = 'A';
    const expected = {
      type: 'query',
      id,
      flags: dnsPacket.RECURSION_DESIRED,
      questions: [
        {
          ['class']: klass,
          name,
          type,
        },
      ],
    };
    expect(doh.getDnsQuery({ type, name, klass, id })).toEqual(expected);
  });

  test('getDnsWireformat', () => {
    const klass = 'IN';
    const name = 'sagi.io';
    const type = 'A';
    const expectedB64 = 'AAABAAABAAAAAAAABHNhZ2kCaW8AAAEAAQ==';
    expect(
      doh.getDnsWireformat({ name, type, klass }).toString('base64')
    ).toEqual(expectedB64);
  });

  test('getOptions', () => {
    const klass = 'IN';
    const name = 'sagi.io';
    const type = 'A';
    const hostname = 'dns.google.com';
    const path = '/experimental';
    const port = 443;
    const userAgent = 'Nietzsche';

    let method = 'POST';
    const expectedPostOptions = {
      headers: {
        'User-Agent': 'Nietzsche',
        accept: 'application/dns-message',
        'content-length': 25,
        'content-type': 'application/dns-message',
      },
      hostname: 'dns.google.com',
      method: 'POST',
      path: '/experimental',
      port: 443,
    };

    expect(
      doh.getOptions({
        method,
        userAgent,
        port,
        hostname,
        path,
        name,
        type,
        klass,
      })
    ).toEqual(expectedPostOptions);

    method = 'GET';
    const expectedGetOptions = {
      headers: {
        'User-Agent': 'Nietzsche',
        accept: 'application/dns-message',
      },
      hostname: 'dns.google.com',
      method: 'GET',
      path: '/experimental?dns=AAABAAABAAAAAAAABHNhZ2kCaW8AAAEAAQ',
      port: 443,
    };

    expect(
      doh.getOptions({
        method,
        userAgent,
        port,
        hostname,
        path,
        name,
        type,
        klass,
      })
    ).toEqual(expectedGetOptions);
  });

  test('query, https, post, error', async () => {
    const https = require('https');
    const method = 'POST';

    const hostname = 'dns.google.com';
    const path = '/experimental';
    const port = 443;
    const userAgent = 'Nietzsche';
    const name = 'sagi.io';
    const type = 'A';
    const klass = 'IN';

    const req = new EventEmitter();
    req.write = jest.fn();
    req.end = jest.fn();
    https.request.mockReturnValueOnce(req);

    const p1 = doh.query({
      name,
      method,
      hostname,
      path,
      port,
      userAgent,
      type,
      klass,
    });

    req.emit('error', 'staged error');
    await expect(p1).rejects.toEqual('staged error');
    expect(req.write).toHaveBeenCalled();
    expect(req.end).toHaveBeenCalled();
  });

  test('query, http, get', async () => {
    const http = require('http');
    const dnsPacket = require('dns-packet');
    const method = 'GET';

    const hostname = 'dns.google.com';
    const path = '/experimental';
    const port = 443;
    const userAgent = 'Nietzsche';
    const name = 'sagi.io';
    const type = 'A';
    const klass = 'IN';
    const useHttps = false;

    const req = new EventEmitter();
    req.write = jest.fn();
    req.end = jest.fn();

    const res = new EventEmitter();
    res.statusCode = 200;

    http.request.mockImplementationOnce((options, handleRes) => {
      handleRes(res);
      return req;
    });

    const p1 = doh.query({
      name,
      method,
      hostname,
      path,
      port,
      userAgent,
      type,
      klass,
      useHttps,
    });

    const dnsWireformat = Buffer.from(
      '4d1681800001000200000001047361676902696f0000010001c00c000100010000012b0004976501c3c00c000100010000012b0004976541c30000290200000000000000',
      'hex'
    );
    res.emit('data', dnsWireformat);
    await expect(p1).resolves.toEqual(dnsPacket.decode(dnsWireformat));
    expect(req.write).not.toHaveBeenCalled();
    expect(req.end).toHaveBeenCalled();
  });

  test('query, http, get, known statusCode error', async () => {
    const http = require('http');
    const dnsPacket = require('dns-packet');
    const method = 'GET';

    const hostname = 'dns.google.com';
    const path = '/experimental';
    const port = 443;
    const userAgent = 'Nietzsche';
    const name = 'sagi.io';
    const type = 'A';
    const klass = 'IN';
    const useHttps = false;

    const req = new EventEmitter();
    req.write = jest.fn();
    req.end = jest.fn();

    const res = new EventEmitter();
    res.statusCode = 400;

    http.request.mockImplementationOnce((options, handleRes) => {
      handleRes(res);
      return req;
    });

    const p1 = doh.query({
      name,
      method,
      hostname,
      path,
      port,
      userAgent,
      type,
      klass,
      useHttps,
    });

    res.emit('data', 'error 400');
    await expect(p1).resolves.toEqual('Error[400]: error 400');
    expect(req.write).not.toHaveBeenCalled();
    expect(req.end).toHaveBeenCalled();
  });

  test('query, http, post, unknown statusCode error', async () => {
    const http = require('http');
    const dnsPacket = require('dns-packet');
    const name = 'sagi.io';
    const useHttps = false;

    const req = new EventEmitter();
    req.write = jest.fn();
    req.end = jest.fn();

    const res = new EventEmitter();
    res.statusCode = 1234;

    http.request.mockImplementationOnce((options, handleRes) => {
      handleRes(res);
      return req;
    });

    const p1 = doh.query({
      name,
      useHttps,
    });

    res.emit('data', 'error 1234');
    await expect(p1).resolves.toEqual(
      'Error[1234]: Unsupported HTTP status code - 1234'
    );
    expect(req.write).toHaveBeenCalled();
    expect(req.end).toHaveBeenCalled();
  });
});
