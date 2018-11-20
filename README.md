# DNS-over-HTTPS API for Node.js

[`@sagi.io/dns-over-https`](https://www.npmjs.com/package/@sagi.io/dns-over-https) is an RFC-8484 compliant Node.js [DNS over HTTPS](https://en.wikipedia.org/wiki/DNS_over_HTTPS) API.

[![CircleCI](https://circleci.com/gh/sagi/dns-over-https-node.svg?style=svg)](https://circleci.com/gh/sagi/dns-over-https-node)
[![Coverage Status](https://coveralls.io/repos/github/sagi/dns-over-https-node/badge.svg?branch=master)](https://coveralls.io/github/sagi/dns-over-https-node?branch=master)
[![MIT License](https://img.shields.io/npm/l/@sagi.io/dns-over-https.svg?style=flat-square)](http://opensource.org/licenses/MIT)
[![version](https://img.shields.io/npm/v/@sagi.io/dns-over-https.svg?style=flat-square)](http://npm.im/@sagi.io/dns-over-https)

## Installation

~~~
$ npm install --save @sagi.io/dns-over-https
~~~

## API

We import as follows:
~~~js
const doh = require('@sagi.io/dns-over-https')
~~~

#### doh.query(...)

~~~js
doh.query = ({
  name,
  method = 'POST',
  hostname = 'cloudflare-dns.com',
  path = '/dns-query',
  port = 443,
  userAgent = '@sagi.io/dns-over-https',
  type = 'A',
  klass = 'IN',
  useHttps = true,
})
~~~

A `name` is mandatory. You can set your own `method`, `hostname`, `path`, `port`, `userAgent`, `type`, `klass` and `useHttps`.

A `Promise` is that resolves to a `DNS`  response object is returned.


For instance,

```js
const doh = require('@sagi/dns-over-https')
(async () => {
  const dnsResponse  = await doh.query({name: 'sagi.io'})
})()
```

Results in:
```
{
  "id": 0,
  "type": "response",
  "flags": 384,
  "flag_qr": true,
  "opcode": "QUERY",
  "flag_aa": false,
  "flag_tc": false,
  "flag_rd": true,
  "flag_ra": true,
  "flag_z": false,
  "flag_ad": false,
  "flag_cd": false,
  "rcode": "NOERROR",
  "questions": [
    {
      "name": "sagi.io",
      "type": "A",
      "class": "IN"
    }
  ],
  "answers": [
    {
      "name": "sagi.io",
      "type": "A",
      "ttl": 300,
      "class": "IN",
      "flush": false,
      "data": "151.101.1.195"
    },
    {
      "name": "sagi.io",
      "type": "A",
      "ttl": 300,
      "class": "IN",
      "flush": false,
      "data": "151.101.65.195"
    }
  ],
  "authorities": [],
  "additionals": []
}

```

More usage examples can be found in [`example`](https://github.com/sagi/dns-over-https-node/blob/master/example/index.js).

## License
MIT
