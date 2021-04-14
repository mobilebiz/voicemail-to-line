exports.handler = async function (context, event, callback) {
  try {
    console.log(`userId: ${event.events[0].source.userId}`);
    callback(null, `OK`);
  } catch (err) {
    callback(err);
  }
};
