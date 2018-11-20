const doh = require('../index.js');

(async () => {
  const r1 = await doh.query({ name: 'sagi.io' });
  const r2 = await doh.query({ name: 'sagi.io', type: 'TXT' });
  const r3 = await doh.query({ name: 'sagi.io', method: 'GET' });
  const r4 = await doh.query({ name: 'sagi.io', method: 'GET', type: 'AAAA' });
  const r5 = await doh.query({
    name: 'authors.bind',
    method: 'GET',
    type: 'TXT',
    klass: 'CH',
  });
  const r6 = await doh.query({
    name: 'sagi.io',
    method: 'GET',
    type: 'AAAA',
    hostname: 'dns.google.com',
    path: '/experimental',
  });

  console.log(JSON.stringify(r6, null, 2));
})();
