const amqp = require("amqplib");

async function consumeCheckout() {
  try {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();
    const queue = "checkout_queue";

    await channel.assertQueue(queue, { durable: true });
    await channel.prefetch(1);

    console.log("Menunggu Checkout...");

    channel.consume(
      queue,
      async (msg) => {
        const checkoutData = JSON.parse(msg.content.toString());
        console.log("\n");
        console.log("Checkout Diterima:", checkoutData);

        // Acknowledge pesan telah diproses
        channel.ack(msg);
      },
      { noAck: false }
    );
  } catch (error) {
    console.error("Error consuming messages:", error);
  }
}
consumeCheckout();
