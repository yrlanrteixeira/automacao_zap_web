import fastify, { FastifyInstance, FastifyPluginOptions } from "fastify";
import { Client, LocalAuth } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import { sendRoute } from "./routes/Send";
import { sendBulkRoute } from "./routes/SendBulk";
import { createGroupRoute } from "./routes/CreateGroup";
import { sendPollRoute } from "./routes/SendPoll";
import { sendMessageAndPollRoute } from "./routes/SendMenssageAndPoll";

declare module "fastify" {
  interface FastifyInstance {
    whatsappClient: Client;
  }
}
const wwebVersion = "2.2412.54";

export const app = async (
  fastify: FastifyInstance,
  opts: FastifyPluginOptions
) => {
  const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      headless: false, // ALTERAR PARA FALSE PARA VER NAVEGADOR EM AÇÃO
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    },
    webVersionCache: {
      type: "remote",
      remotePath: `https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/${wwebVersion}.html`,
    },
  });

  fastify.decorate("whatsappClient", client);

  client.on("qr", (qr: string) => {
    qrcode.generate(qr, { small: true });
    console.log("QR RECEIVED", qr);
  });

  client.on("ready", () => {
    console.log("Client is ready!");
  });

  client.on("auth_failure", (msg) => {
    console.error("Authentication failure", msg);
  });

  client.on("disconnected", (reason) => {
    console.log("Client was logged out", reason);
  });

  client.initialize();

  fastify.register(sendRoute);
  fastify.register(sendBulkRoute);
  fastify.register(createGroupRoute);
  fastify.register(sendPollRoute);
  fastify.register(sendMessageAndPollRoute);
};
