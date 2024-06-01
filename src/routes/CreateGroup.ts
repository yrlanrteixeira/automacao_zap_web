import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { WhatsAppService } from "../services/WhatsAppService";

interface CreateGroupRequest {
  groupName: string;
  names: string[];
}

export const createGroupRoute = async (
  fastify: FastifyInstance,
  opts: FastifyPluginOptions
) => {
  const whatsappService = new WhatsAppService(fastify.whatsappClient);

  fastify.post<{
    Body: CreateGroupRequest;
  }>("/createGroup", async (request, reply) => {
    const { groupName, names } = request.body;

    try {
      await whatsappService.createGroupByName(groupName, names);
      reply.send({ status: "Group created" });
    } catch (error) {
      reply.send({
        status: "Failed to create group",
        error: (error as Error).message,
      });
    }
  });
};
