import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { WhatsAppService } from "../services/WhatsAppService";

interface SendMessageAndPoll {
  names: string[];
  message: string;
  pollQuestion: string;
  pollOptions: string[];
  allowMultipleAnswers?: boolean;
  messageSecret?: number[];
}

export const sendMessageAndPollRoute = async (
  fastify: FastifyInstance,
  opts: FastifyPluginOptions
) => {
  const whatsappService = new WhatsAppService(fastify.whatsappClient);

  fastify.post<{
    Body: SendMessageAndPoll;
  }>("/sendMessageAndPoll", async (request, reply) => {
    const {
      names,
      message,
      pollQuestion,
      pollOptions,
      allowMultipleAnswers,
      messageSecret,
    } = request.body;

    try {
      await whatsappService.sendMessageAndPoll(
        names,
        message,
        pollQuestion,
        pollOptions,
        allowMultipleAnswers,
        messageSecret
      );
      reply.send({ status: "Message and poll sent" });
    } catch (error) {
      reply.send({
        status: "Failed to send message and poll",
        error: (error as Error).message,
      });
    }
  });
};
