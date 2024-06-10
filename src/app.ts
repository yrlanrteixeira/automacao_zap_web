import { FastifyInstance, FastifyPluginOptions } from "fastify";
import fastifyCors from "@fastify/cors";
import { Client, LocalAuth } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import { routes } from "./routes/index";

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

  // Configurando o CORS
  fastify.register(fastifyCors, {
    origin: (origin, cb) => {
      if (!origin || /localhost/.test(origin)) {
        cb(null, true);
        return;
      }
      cb(new Error("Not allowed"), false);
    },
    methods: ["GET", "PUT", "POST", "DELETE"],
  });

  fastify.register(routes);
};
