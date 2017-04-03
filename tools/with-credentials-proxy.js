"use strict";

const browserSync = require("browser-sync");
const cookie = require('cookie');

const COUNTER_COOKIE = 'counter';


function handleProxyRequest(proxyRes, req, res) {

  const cookies = cookie.parse(req.headers.cookie || '');

  const cookie_value_string = cookies[COUNTER_COOKIE];
  console.log(req.url, 'has cookie counter =', cookie_value_string);

  let counter = 0;
  try {
    counter = parseInt(cookie_value_string || '0');
  } catch (error) {
    console.error('Strange counter!');
  }

  res.setHeader('Set-Cookie', cookie.serialize(COUNTER_COOKIE, String(counter + 1)));

  if (req.headers.origin) {
    proxyRes.headers['access-control-allow-origin'] = req.headers.origin;
    proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
  }
}


browserSync({
  port: 3333,
  https: true,
  open: false,
  ui: false,
  proxy: {
    target: "https://localhost:9002",
    proxyRes: [handleProxyRequest]
  }
});