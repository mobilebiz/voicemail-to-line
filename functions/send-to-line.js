const LINE = require("@line/bot-sdk");
exports.handler = async function (context, event, callback) {
  try {
    // Check parameter
    const message = event.message || "";
    if (message === "") throw new Error(`Parameter 'message' not set.`);
    const from = event.from || "";
    if (from === "") throw new Error(`Parameter 'from' not set.`);

    // LINE Client
    const client = new LINE.Client({
      channelAccessToken: context.LINE_ACCESS_TOKEN,
    });

    // Set params
    const params = {
      type: "text",
      text: `
留守番電話をお預かりしました。\n
電話番号:${from.replace(/\+81/, "0")}\n
${message}
      `,
    };

    await client.pushMessage(context.LINE_USER_ID, params);
    callback(null, `Message sent.`);
  } catch (err) {
    callback(err);
  }
};
