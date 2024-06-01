import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { WhatsAppService } from "../services/WhatsAppService";

interface SendPollRequest {
  names: string[];
  pollQuestion: string;
  pollOptions: string[];
  allowMultipleAnswers?: boolean;
  messageSecret?: number[];
}

export const sendPollRoute = async (
  fastify: FastifyInstance,
  opts: FastifyPluginOptions
) => {
  const whatsappService = new WhatsAppService(fastify.whatsappClient);

  fastify.post<{
    Body: SendPollRequest;
  }>("/sendPoll", async (request, reply) => {
    const {
      names,
      pollQuestion,
      pollOptions,
      allowMultipleAnswers,
      messageSecret,
    } = request.body;

    try {
      await whatsappService.sendPollByName(
        names,
        pollQuestion,
        pollOptions,
        allowMultipleAnswers,
        messageSecret
      );
      reply.send({ status: "Poll sent" });
    } catch (error) {
      reply.send({
        status: "Failed to send poll",
        error: (error as Error).message,
      });
    }
  });
};
