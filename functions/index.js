const { onRequest } = require('firebase-functions/v2/https');
const next = require('next');

const nextApp = next({
  dev: false,
  conf: {
    distDir: '.next',
  },
});

const nextHandle = nextApp.getRequestHandler();

exports.nextServer = onRequest(
  {
    region: 'us-central1',
    memory: '512MiB',
    timeoutSeconds: 60,
  },
  async (req, res) => {
    await nextApp.prepare();
    return nextHandle(req, res);
  }
);
