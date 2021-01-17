export const createSubscriptionHandler = (
  topic: string,
  handler: (buf: Buffer) => any
) => ({
  topic,
  handler: function subscriptionHandler(receivedTopic: string, buf: Buffer) {
    if (topic === receivedTopic) {
      handler(buf);
    }
  },
});

export const parseBufferAsJson = <T>(buf: Buffer): T =>
  JSON.parse(buf.toString());
