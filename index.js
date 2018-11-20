const base64url = require('base64url');
const dnsPacket = require('dns-packet');

const getDnsQuery = ({ type, name, klass, id }) => ({
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
});

const getDnsWireformat = ({ name, type, klass }) => {
  const id = 0; // As mandated by RFC-8484.
  const dnsQuery = getDnsQuery({ type, name, klass, id });
  const dnsQueryBuf = dnsPacket.encode(dnsQuery);
  return dnsQueryBuf;
};

const getOptions = ({
  method,
  userAgent,
  port,
  hostname,
  path,
  name,
  type,
  klass,
}) => {
  const dnsWireformat = getDnsWireformat({ name, type, klass });
  const isPost = method === 'POST';
  const dohPath = isPost ? path : `${path}?dns=${base64url(dnsWireformat)}`;
  const headers = {
    accept: 'application/dns-message',
    'User-Agent': userAgent,
    ...(isPost && {
      'content-type': 'application/dns-message',
      'content-length': dnsWireformat.length,
    }),
  };
  return { hostname, headers, method, path: dohPath, port };
};

const query = ({
  name,
  method = 'POST',
  hostname = 'cloudflare-dns.com',
  path = '/dns-query',
  port = 443,
  userAgent = '@sagi/dns-over-https',
  type = 'A',
  klass = 'IN',
  useHttps = true,
}) =>
  new Promise((resolve, reject) => {
    const options = getOptions({
      method,
      hostname,
      path,
      port,
      userAgent,
      name,
      type,
      klass,
    });
    const httpAgent = useHttps ? require('https') : require('http');

    const req = httpAgent.request(options, res =>
      res.on('data', data => {
        const { statusCode } = res;

        switch (statusCode) {
          case 200:
            resolve(dnsPacket.decode(data));
            break;
          case 400:
          case 413:
          case 415:
          case 504:
            resolve(`Error[${statusCode}]: ${data.toString()}`);
            break;
          default:
            resolve(
              `Error[${statusCode}]: Unsupported HTTP status code - ${statusCode}`
            );
        }
      })
    );

    if (method === 'POST') {
      const dnsWireformat = getDnsWireformat({ name, type, klass });
      req.write(dnsWireformat);
    }
    req.on('error', e => reject(e));
    req.end();
  });

module.exports = { getDnsWireformat, getDnsQuery, getOptions, query };
