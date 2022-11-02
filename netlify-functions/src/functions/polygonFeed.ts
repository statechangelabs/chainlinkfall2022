import { Handler } from "@netlify/functions";
import fetch from "node-fetch";
import { parseWebhook, remitToChain } from "../functions";
const handler: Handler = async (event, context) => {
  // your server-side functionality
  //console.log("environment variables", process.env);
  const parsed = parseWebhook(event.body);
  if (!parsed) return { statusCode: 400, body: "Bad Request" };
  console.log("Webhook object is ", parsed);
  //Run the code to manage the shape

  //Do things based on the webhook object.
  //Like, make a request to get the current price of the symbol
  const symbol: string = parsed.decodedData.string_1;
  const polygonKey = "kTQbYuAtj_P5xdAuDhzRtAfirmuRm8br";
  const url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/prev?adjusted=true&apiKey=${polygonKey}`;
  //const url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/${startDate}/${endDate}?apiKey=${polygonKey}`;
  const response = await fetch(url, {
    headers: { Authentication: `Bearer ${polygonKey}` },
  });
  const json = (await response.json()) as { results: { c: number }[] };
  console.log("My json is ", json, url);
  const lastPrice = Math.floor((json.results.pop()?.c || 0) * 100);
  console.log("My last price is ", lastPrice);

  //send result home
  //fetch the oracle remitter
  // remitToChain(lastPrice, event.body);
  return {
    statusCode: 200,
    body: lastPrice.toString(),
  };
};
export { handler };
