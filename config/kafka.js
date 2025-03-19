const { Kafka, Partitioners } = require("kafkajs");

const kafka = new Kafka({
  clientId: "my-app",
  brokers: ["localhost:9092"], // Change this for remote brokers
});

const producer = kafka.producer({
  createPartitioner: Partitioners.LegacyPartitioner,
});

const consumer = kafka.consumer({
  groupId: "email-notifications-group",
  sessionTimeout: 30000,
});

const connectKafka = async () => {
  try {
    await producer.connect();
    console.log("Kafka Producer Connected");

    await consumer.connect();
    console.log("Kafka Consumer Connected");

    await consumer.subscribe({
      topic: "email-notifications",
      fromBeginning: false,
    });
  } catch (error) {
    console.error("Kafka Connection Failed", error);
    process.exit(1);
  }
};

module.exports = { kafka, producer, consumer, connectKafka };
