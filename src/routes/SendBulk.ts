import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { WhatsAppService } from "../services/WhatsAppService";

interface SendMessagesRequest {
  names: string[];
  message: string;
}

export const sendBulkRoute = async (
  fastify: FastifyInstance,
  opts: FastifyPluginOptions
) => {
  const whatsappService = new WhatsAppService(fastify.whatsappClient);

  fastify.post<{
    Body: SendMessagesRequest;
  }>("/sendBulk", async (request, reply) => {
    const { names, message } = request.body;

    try {
      await whatsappService.sendMessagesByName(names, message);
      reply.send({ status: "Messages sent" });
    } catch (error) {
      reply.send({
        status: "Failed to send messages",
        error: (error as Error).message,
      });
    }
  });
};
