import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { Multipart } from "@fastify/multipart";
import { WhatsAppService } from "../services/whatsApp-service";
import {
  CreateGroupRequest,
  CreateMultipleGroupsRequest,
  SendMessageAndPoll,
  SendMessagesRequest,
  SendMessageQuery,
  SendPollRequest,
} from "../interfaces";
import { Readable } from "stream";
import { processTasks } from "../utils/dataProcessing";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
        reply.send({
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
        reply.send({
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
      reply.send({
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
        reply.send({
          status: "Failed to send poll",
          error: (error as Error).message,
        });
      }
    }
  );

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

  fastify.post("/upload", async (request, reply) => {
    const parts = request.parts();
    let fileBuffer: Buffer | null = null;

    for await (const part of parts) {
      if (part.type === "file") {
        const chunks: Buffer[] = [];
        for await (const chunk of part.file) {
          chunks.push(chunk);
        }
        fileBuffer = Buffer.concat(chunks);
      }
    }

    if (fileBuffer) {
      try {
        const tasks = JSON.parse(fileBuffer.toString());
        const processedTasks = await processTasks(tasks);

        // Adiciona um lote para cada upload
        const lote = `Lote_${Date.now()}`;

        const dataWithLote = processedTasks.map((item) => ({
          ...item,
          lote,
          data_solicitacao_escala: item.data_solicitacao_escala
            ? item.data_solicitacao_escala.toISOString()
            : null,
        }));

        // Armazenar no banco de dados com Prisma
        await prisma.task.createMany({
          data: dataWithLote,
          skipDuplicates: true,
        });

        reply.send({ status: "Data stored in database", data: dataWithLote });
      } catch (error) {
        console.error("Error processing file:", error);
        reply.status(500).send({ error: "Failed to process the file" });
      }
    } else {
      reply.status(400).send({ error: "No file uploaded" });
    }
  });

  fastify.get("/tasks", async (request, reply) => {
    try {
      const tasks = await prisma.task.findMany();
      reply.send(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      reply.status(500).send({ error: "Failed to fetch tasks" });
    }
  });

  fastify.get("/tasks/:lote", async (request, reply) => {
    const { lote } = request.params;
    try {
      const tasks = await prisma.task.findMany({
        where: { lote },
      });
      reply.send(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      reply.status(500).send({ error: "Failed to fetch tasks" });
    }
  });
};
