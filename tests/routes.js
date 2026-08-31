import http from "http";

const BASE_URL = "http://localhost:3000";

function request(method, path) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });

    req.on("error", reject);
    req.end();
  });
}

async function runTests() {
  console.log("Testing endpoints...\n");

  // Test GET /
  console.log("GET / (should redirect to /app)");
  let res = await request("GET", "/");
  console.log(`  Status: ${res.status}`);
  console.log(`  Location: ${res.headers.location}\n`);

  // Test POST /
  console.log("POST / (should be 405)");
  res = await request("POST", "/");
  console.log(`  Status: ${res.status}`);
  console.log(`  Body: ${res.body}\n`);

  // Test GET /app
  console.log("GET /app");
  res = await request("GET", "/app");
  console.log(`  Status: ${res.status}`);
  console.log(`  Body: ${res.body.substring(0, 100)}...\n`);

  // Test POST /app
  console.log("POST /app (should be 405)");
  res = await request("POST", "/app");
  console.log(`  Status: ${res.status}`);
  console.log(`  Body: ${res.body}\n`);

  // Test GET /nothing (should be 404)
  console.log("GET /nothing (should be 404)");
  res = await request("GET", "/nothing");
  console.log(`  Status: ${res.status}`);
  console.log(`  Body: ${res.body}\n`);

  // Test POST /nothing (should be 404 or 405)
  console.log("POST /nothing (should be 404)");
  res = await request("POST", "/nothing");
  console.log(`  Status: ${res.status}`);
  console.log(`  Body: ${res.body}\n`);
}

runTests().catch(console.error);
