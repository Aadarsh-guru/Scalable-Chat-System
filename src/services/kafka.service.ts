import { Kafka, Partitioners, Producer, logLevel } from 'kafkajs';
import { CreateMessageType } from '../types';
import prisma from '../config/db.config';

const kafkaTopic = 'messages';

// Kafka configuration for secured cluster
const kafka = new Kafka({
    brokers: [process.env.KAFKA_REST_URL as string],
    ssl: true,
    sasl: {
        mechanism: 'scram-sha-256',
        username: process.env.KAFKA_REST_USERNAME as string,
        password: process.env.KAFKA_REST_PASSWORD as string
    },
    logLevel: logLevel.ERROR,
});

let producer: Producer | null = null;

const createProducer = async () => {
    if (producer) {
        return producer;
    }
    const _producer = kafka.producer({
        createPartitioner: Partitioners.LegacyPartitioner,
    });
    await _producer.connect();
    producer = _producer;
    return producer;
};

const produceMessage = async (message: CreateMessageType) => {
    const producer = await createProducer();
    await producer.send({
        topic: kafkaTopic,
        messages: [
            {
                key: message.id,
                value: JSON.stringify(message),
            },
        ],
    });
    return message;
};

const startMessageConsumer = async () => {
    const consumer = kafka.consumer({ groupId: 'default' });
    await consumer.connect();
    await consumer.subscribe({ topic: kafkaTopic, fromBeginning: true });
    await consumer.run({
        autoCommit: true,
        eachMessage: async ({ message, pause }) => {
            if (!message.value) {
                return;
            };
            const messageData = JSON.parse(message.value.toString()) as CreateMessageType;

            // saving message into the database.
            try {
                await prisma.message.create({
                    data: {
                        id: messageData.id,
                        body: messageData.body,
                        senderId: messageData.senderId,
                        conversationId: messageData.conversationId,
                        messageType: messageData.messageType
                    }
                });
            } catch (error) {
                console.log(error);
                pause();
                setTimeout(() => {
                    consumer.resume([{ topic: kafkaTopic }]);
                }, 1000 * 60);
            };
        }
    });
    return consumer;
};

export {
    createProducer,
    produceMessage,
    startMessageConsumer,
};

export default kafka;