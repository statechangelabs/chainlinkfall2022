import { Handler } from "@netlify/functions";

const handler: Handler = async (event, context) => {
  // your server-side functionality

  const output = {
    event,
    body: event.body,
    parsed: event.body && JSON.parse(event.body),
  };
  return { statusCode: 200, body: "<pre>" + JSON.stringify(output) + "</pre>" };
};
export { handler };
