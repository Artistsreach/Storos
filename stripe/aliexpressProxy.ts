import * as functions from 'firebase-functions';
import * as https from 'https';

export const aliexpressProxy = functions.https.onRequest((request, response) => {
  response.set('Access-Control-Allow-Origin', '*');

  if (request.method === 'OPTIONS') {
    response.set('Access-Control-Allow-Methods', 'GET');
    response.set('Access-Control-Allow-Headers', 'Content-Type');
    response.set('Access-Control-Max-Age', '3600');
    response.status(204).send('');
    return;
  }

  const { keywords, productId } = request.query;

  if (!keywords && !productId) {
    response.status(400).send('Missing "keywords" or "productId" query parameter.');
    return;
  }

  let path;
  if (keywords) {
    path = `/api/v3/products?page_no=1&ship_to_country=US&keywords=${encodeURIComponent(keywords as string)}&target_currency=USD&target_language=EN&page_size=50&sort=SALE_PRICE_ASC`;
  } else {
    path = `/api/v3/product/details?product_id=${productId}&target_currency=USD&target_language=EN`;
  }

  const options = {
    method: 'GET',
    hostname: 'aliexpress-true-api.p.rapidapi.com',
    port: null,
    path,
    headers: {
      'x-rapidapi-key': functions.config().rapidapi.key,
      'x-rapidapi-host': 'aliexpress-true-api.p.rapidapi.com',
    },
  };

  const proxyRequest = https.request(options, (proxyResponse) => {
    let body = '';
    proxyResponse.on('data', (chunk) => {
      body += chunk;
    });
    proxyResponse.on('end', () => {
      response.status(200).send(body);
    });
  });

  proxyRequest.on('error', (error) => {
    console.error('Proxy Request Error:', error);
    response.status(500).send('Proxy request failed.');
  });

  proxyRequest.end();
});
