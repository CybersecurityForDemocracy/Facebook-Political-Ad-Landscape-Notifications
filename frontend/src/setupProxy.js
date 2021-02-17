const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = (app) => {
  app.use(
    '/api/v1',
    createProxyMiddleware({
      target: 'https://poladstransparency-17744-stage.herokuapp.com',
      changeOrigin: true,
      // pathRewrite: { '^/api' : '' },
    }),
  );
};
