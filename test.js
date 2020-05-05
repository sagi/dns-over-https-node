const doh = require("./index");

async function run() {
  let r1 = await doh
    .query({
      name: "google.com",
      method: "GET",
      hostname: "dns.google.com",
      path: "/dns-query",
      port: 443,
      userAgent: "@sagi.io/dns-over-https",
      type: "A",
      klass: "IN",
      useHttps: true,
    })
    .catch((err) => {
      console.log(err);
    });

  console.log(rl);
}

run();
