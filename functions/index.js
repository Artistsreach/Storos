const functions = require("firebase-functions");
const fetch = require("node-fetch");
const cors = require("cors")({ origin: true });

exports.aliexpressProxy = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const keywords = req.query.keywords;
    if (!keywords) {
      return res.status(400).send("Missing keywords parameter");
    }

    const url = `https://aliexpress-true-api.p.rapidapi.com/api/v3/products?page_no=1&ship_to_country=US&keywords=${encodeURIComponent(keywords)}&target_currency=USD&target_language=EN&page_size=50&sort=SALE_PRICE_ASC`;

    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': '270de00b86msh428afc76ee3eb99p10aef1jsnce9aa1302e03',
        'x-rapidapi-host': 'aliexpress-true-api.p.rapidapi.com'
      }
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      res.status(200).send(data);
    } catch (error) {
      console.error("AliExpress API Error:", error);
      res.status(500).send("Error fetching from AliExpress API");
    }
  });
});
