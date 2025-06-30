"use strict";
const functions = require("firebase-functions");
const https = require("https");

exports.aliexpressProxy = functions.https.onRequest((request, response) => {
  response.set('Access-Control-Allow-Origin', '*');
  if (request.method === 'OPTIONS') {
      response.set('Access-Control-Allow-Methods', 'GET');
      response.set('Access-Control-Allow-Headers', 'Content-Type');
      response.set('Access-Control-Max-Age', '3600');
      response.status(204).send('');
      return;
  }

  const searchParams = new URLSearchParams({
    q: request.query.q || 'iphone',
    page: request.query.page || '1',
    sort: request.query.sort || 'default'
  });

  const options = {
    method: 'GET',
    hostname: 'aliexpress-datahub.p.rapidapi.com',
    port: null,
    path: `/item_search_2?${searchParams.toString()}`,
    headers: {
      'x-rapidapi-key': '270de00b86msh428afc76ee3eb99p10aef1jsnce9aa1302e03',
      'x-rapidapi-host': 'aliexpress-datahub.p.rapidapi.com'
    }
  };

  const req = https.request(options, function (res) {
    const chunks = [];

    res.on('data', function (chunk) {
      chunks.push(chunk);
    });

    res.on('end', function () {
      const body = Buffer.concat(chunks);
      response.status(res.statusCode).send(body.toString());
    });
  });

  req.on('error', (error) => {
    console.error(error);
    response.status(500).send('An unexpected error occurred.');
  });

  req.end();
});
