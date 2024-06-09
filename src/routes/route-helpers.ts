import { WhatsAppService } from "../services/whatsApp-service";

export const createGroupHandler = async (
  service: WhatsAppService,
  request: any,
  reply: any
) => {
  const { groupName, names } = request.body;
  await service.createGroupByName(groupName, names);
  reply.send({ status: "Group created" });
};

export const createMultipleGroupsHandler = async (
  service: WhatsAppService,
  request: any,
  reply: any
) => {
  const { groupNames, names, interval } = request.body;
  await service.createMultipleGroups(groupNames, names, interval);
  reply.send({ status: "Groups created" });
};

export const sendMessageAndPollHandler = async (
  service: WhatsAppService,
  request: any,
  reply: any
) => {
  const {
    names,
    message,
    pollQuestion,
    pollOptions,
    allowMultipleAnswers,
    messageSecret,
  } = request.body;
  await service.sendMessageAndPoll(
    names,
    message,
    pollQuestion,
    pollOptions,
    allowMultipleAnswers,
    messageSecret
  );
  reply.send({ status: "Message and poll sent" });
};

export const sendMessagesByNameHandler = async (
  service: WhatsAppService,
  request: any,
  reply: any
) => {
  const { names, message } = request.body;
  await service.sendMessagesByName(names, message);
  reply.send({ status: "Messages sent" });
};

export const sendMessageHandler = async (
  service: WhatsAppService,
  request: any,
  reply: any
) => {
  const { number, message } = request.query;
  await service.sendMessage(number, message);
  reply.send({ status: "Message sent" });
};

export const sendPollHandler = async (
  service: WhatsAppService,
  request: any,
  reply: any
) => {
  const {
    names,
    pollQuestion,
    pollOptions,
    allowMultipleAnswers,
    messageSecret,
  } = request.body;
  await service.sendPollByName(
    names,
    pollQuestion,
    pollOptions,
    allowMultipleAnswers,
    messageSecret
  );
  reply.send({ status: "Poll sent" });
};
