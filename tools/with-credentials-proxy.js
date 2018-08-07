/*
 * Copyright 2017-present Acrolinx GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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