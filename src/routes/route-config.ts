import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { WhatsAppService } from "../services/whatsApp-service";

interface RouteConfig {
  method: "GET" | "POST";
  url: string;
  handler: (
    service: WhatsAppService,
    request: any,
    reply: any
  ) => Promise<void>;
}

export const registerRoutes = (
  fastify: FastifyInstance,
  opts: FastifyPluginOptions,
  routes: RouteConfig[]
) => {
  const whatsappService = new WhatsAppService(fastify.whatsappClient);

  routes.forEach((route) => {
    fastify.route({
      method: route.method,
      url: route.url,
      handler: async (request, reply) => {
        try {
          await route.handler(whatsappService, request, reply);
        } catch (error) {
          reply.send({
            status: "Failed",
            error: (error as Error).message,
          });
        }
      },
    });
  });
};
