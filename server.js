const { createServer } = require("http");
const next = require("next");

const app = next({
  dev: false,
});

const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res);
  });

  server.listen();
});