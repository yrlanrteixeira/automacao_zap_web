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

  fastify.post<{
    Body: CreateGroupRequest;
  }>("/createGroup", async (request, reply) => {
    const { groupName, names, description, admins, setInfoAdminsOnly } =
      request.body;

    try {
      await whatsappService.createGroupByName(
        groupName,
        names,
        description,
        admins,
        setInfoAdminsOnly
      );
      reply.send({ status: "Group created" });
    } catch (error) {
      reply.send({
        status: "Failed to create group",
        error: (error as Error).message,
      });
    }
  });

  fastify.post<{
    Body: CreateMultipleGroupsRequest;
  }>("/createMultipleGroups", async (request, reply) => {
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
        admins,
        setInfoAdminsOnly
      );
      reply.send({ status: "Groups created" });
    } catch (error) {
      reply.send({
        status: "Failed to create groups",
        error: (error as Error).message,
      });
    }
  });

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

  fastify.post<{
    Body: SendMessagesRequest;
  }>("/sendMessage", async (request, reply) => {
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
