const fetch = require("node-fetch");
/*
Note: Add @nodelesslink/core to your project via
  `yarn add @nodelesslink/core` or 
  `npm install @nodelesslink/core`
*/
const handler = async (event, context) => {
  const parsed = JSON.parse(event.body);
  if (!parsed) return { statusCode: 400, body: "Bad Request" };
  if(parsed.jobId.toLowerCase() !== "{{{jobId}}}".toLowerCase()) return { statusCode: 400, body: "Bad Request" };
  // This is where the arguments from Solidity come in
  const { {{{decodedKeys}}} } = parsed.decodedData;
  let returnValue;

/**
 * This is where you put in your code to retrieve your value
 * Confirm the returnvalue got set
 * 
 * Sample: 
    const polygonKey = "MYPOLYGONKEY";
    const url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/prev?adjusted=true&apiKey=${polygonKey}`;
    const response = await fetch(url, {
        headers: { Authentication: `Bearer ${polygonKey}` },
    });
    const json = await response.json();
    returnValue = Math.floor((json.results.pop().c || 0) * 100);
 */
  return { statusCode: 200, body: returnValue.toString() };
};
module.exports= { handler };