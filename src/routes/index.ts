import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { WhatsAppService } from "../services/whatsApp-service";
import {
  CreateGroupRequest,
  CreateMultipleGroupsRequest,
  SendMessageAndPoll,
  SendMessagesRequest,
  SendMessageQuery,
  SendPollRequest,
} from "../interfaces";

export const routes = async (
  fastify: FastifyInstance,
  opts: FastifyPluginOptions
) => {
  const whatsappService = new WhatsAppService(fastify.whatsappClient);

  fastify.register(require("@fastify/multipart"));

  fastify.post<{ Body: CreateGroupRequest }>(
    "/createGroup",
    async (request, reply) => {
      const { groupName, names, description, admins, setInfoAdminsOnly } =
        request.body;

      try {
        await whatsappService.createGroupByName(
          groupName,
          names,
          description,
          admins
        );
        reply.send({ status: "Group created" });
      } catch (error) {
        reply.status(500).send({
          status: "Failed to create group",
          error: (error as Error).message,
        });
      }
    }
  );

  fastify.post<{ Body: CreateMultipleGroupsRequest }>(
    "/createMultipleGroups",
    async (request, reply) => {
      const {
        groupNames,
        names,
        minInterval,
        maxInterval,
        description,
        admins,
        setInfoAdminsOnly,
      } = request.body;

      try {
        await whatsappService.createMultipleGroups(
          groupNames,
          names,
          minInterval,
          maxInterval,
          description,
          admins
        );
        reply.send({ status: "Groups created" });
      } catch (error) {
        reply.status(500).send({
          status: "Failed to create groups",
          error: (error as Error).message,
        });
      }
    }
  );

  fastify.post<{ Body: SendMessageAndPoll }>(
    "/sendMessageAndPoll",
    async (request, reply) => {
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
        reply.status(500).send({
          status: "Failed to send message and poll",
          error: (error as Error).message,
        });
      }
    }
  );

  fastify.post<{ Body: SendMessagesRequest }>(
    "/sendMessage",
    async (request, reply) => {
      const { names, message } = request.body;

      try {
        await whatsappService.sendMessagesByName(names, message);
        reply.send({ status: "Messages sent" });
      } catch (error) {
        reply.status(500).send({
          status: "Failed to send messages",
          error: (error as Error).message,
        });
      }
    }
  );

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
      reply.status(500).send({
        status: "Failed to send message",
        error: (error as Error).message,
      });
    }
  });

  fastify.post<{ Body: SendPollRequest }>(
    "/sendPoll",
    async (request, reply) => {
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
        reply.status(500).send({
          status: "Failed to send poll",
          error: (error as Error).message,
        });
      }
    }
  );

  fastify.post<{ Body: any }>("/process-group-data", async (request, reply) => {
    const { data } = request.body;

    try {
      await whatsappService.createGroupsAndSendMessages(data);
      reply.send({ status: "Groups created and messages sent" });
    } catch (error) {
      reply.status(500).send({
        status: "Failed to process group data",
        error: (error as Error).message,
      });
    }
  });

  fastify.post("/sendGroupMessage", async (request, reply) => {
    const { groupId, message } = request.body;

    try {
      await whatsappService.sendGroupMessage(groupId, message);
      reply.send({ status: "Message sent to group" });
    } catch (error) {
      reply.status(500).send({
        status: "Failed to send message to group",
        error: (error as Error).message,
      });
    }
  });

  fastify.get("/listContacts", async (request, reply) => {
    try {
      const contacts = await whatsappService.listContacts();
      reply.send({ contacts });
    } catch (error) {
      reply.status(500).send({
        status: "Failed to list contacts",
        error: (error as Error).message,
      });
    }
  });

  fastify.get("/getQRCode", async (request, reply) => {
    if (fastify.qrCode) {
      reply.send({ qrCode: fastify.qrCode });
    } else {
      reply.status(404).send({ error: "QR Code not available" });
    }
  });

  fastify.get("/connectionStatus", async (request, reply) => {
    const isConnected = fastify.qrCode === null;
    reply.send({ connected: isConnected });
  });

  fastify.get("/health", async (request, reply) => {
    reply.send({ status: "ok" });
  });
};
