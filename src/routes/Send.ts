import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { WhatsAppService } from "../services/WhatsAppService";

interface SendMessageQuery {
  number: string;
  message: string;
}

export const sendRoute = async (
  fastify: FastifyInstance,
  opts: FastifyPluginOptions
) => {
  const whatsappService = new WhatsAppService(fastify.whatsappClient);

  fastify.get("/send", async (request, reply) => {
    const { number, message } = request.query as SendMessageQuery;
    try {
      const formattedNumber = number.startsWith("+")
        ? number.substring(1)
        : number;
      const chatId = `${formattedNumber}@c.us`;
      await whatsappService.sendMessage(chatId, message);
      reply.send({ status: "Message sent" });
    } catch (error) {
      reply.send({
        status: "Failed to send message",
        error: (error as Error).message,
      });
    }
  });
};
