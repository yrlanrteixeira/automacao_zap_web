import fastify from "fastify";
import { app } from "./app";

const server = fastify();

server.register(app);

server.listen({ port: 3333, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`🚀 Server running at ${address}`);
});
