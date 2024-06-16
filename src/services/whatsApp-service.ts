import { fastify } from "fastify";
import {
  Client,
  GroupChat,
  Poll,
  PollSendOptions,
  ChatId,
} from "whatsapp-web.js";

const formatPhoneNumber = (number: string): string => {
  let formattedNumber = number.replace(/[\s()-]/g, "");

  if (!formattedNumber.startsWith("+")) {
    formattedNumber = `+${formattedNumber}`;
  }

  if (!/^\+\d{1,15}$/.test(formattedNumber)) {
    throw new Error(`Invalid phone number format: ${formattedNumber}`);
  }

  return formattedNumber;
};

export class WhatsAppService {
  private client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  private async findContactsByName(names: string[]): Promise<ChatId[]> {
    const contacts = await this.client.getContacts();
    const contactIds: ChatId[] = [];
    const notFound: string[] = [];

    for (const name of names) {
      const contact = contacts.find(
        (c) => c.name === name || c.pushname === name || c.shortName === name
      );
      if (contact) {
        contactIds.push(contact.id);
      } else {
        notFound.push(name);
      }
    }

    if (notFound.length > 0) {
      console.log(`Contacts not found: ${notFound.join(", ")}`);
    }

    return contactIds;
  }

  public async sendMessagesByName(
    names: string[],
    message: string
  ): Promise<void> {
    const contacts = await this.client.getContacts();
    for (const name of names) {
      const contact = contacts.find(
        (c) => c.name === name || c.pushname === name || c.shortName === name
      );
      if (contact) {
        await this.client.sendMessage(contact.id._serialized, message);
      }
    }
  }

  public async createGroupByName(
    groupName: string,
    names: string[],
    description?: string,
    admins?: string[],
    setInfoAdminsOnly?: boolean
  ): Promise<void> {
    const participantIds = await this.findContactsByName(names);
    if (participantIds.length > 0) {
      const groupResult = await this.client.createGroup(
        groupName,
        participantIds.map((id) => id._serialized)
      );

      if (typeof groupResult !== "string") {
        console.log(`Group ${groupName} created`);
        const groupChat = (await this.client.getChatById(
          groupResult.gid._serialized
        )) as GroupChat;

        if (description) {
          await groupChat.setDescription(description);
          console.log(`Description set for group ${groupName}`);
        }

        if (admins && admins.length > 0) {
          const adminIds = await this.findContactsByName(admins);
          await groupChat.promoteParticipants(
            adminIds.map((id) => id._serialized)
          );
          console.log(`Admins promoted for group ${groupName}`);
        }

        if (setInfoAdminsOnly) {
          await groupChat.setInfoAdminsOnly(true);
          console.log(`Only admins can edit the group info for ${groupName}`);
        }
      } else {
        console.log(`Error creating group: ${groupResult}`);
      }
    } else {
      console.log(`No valid participants found for group: ${groupName}`);
    }
  }

  public async createMultipleGroups(
    groupNames: string[],
    names: string[],
    minInterval: number,
    maxInterval: number,
    description?: string,
    admins?: string[],
    setInfoAdminsOnly?: boolean
  ): Promise<void> {
    for (const groupName of groupNames) {
      await this.createGroupByName(
        groupName,
        names,
        description,
        admins,
        setInfoAdminsOnly
      );
      const interval =
        Math.floor(Math.random() * (maxInterval - minInterval + 1)) +
        minInterval;
      console.log(`Waiting for ${interval}ms before creating the next group`);
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
  }

  public async sendPollByName(
    names: string[],
    pollQuestion: string,
    pollOptions: string[],
    allowMultipleAnswers: boolean = false,
    messageSecret?: number[]
  ): Promise<void> {
    const contacts = await this.client.getContacts();
    const options: PollSendOptions = {
      allowMultipleAnswers: allowMultipleAnswers,
      messageSecret: messageSecret ?? [],
    };

    for (const name of names) {
      const contact = contacts.find(
        (c) => c.name === name || c.pushname === name || c.shortName === name
      );
      if (contact) {
        //@ts-ignore
        const poll = new Poll(pollQuestion, pollOptions, options);
        await this.client.sendMessage(contact.id._serialized, poll);
      }
    }
  }

  public async sendMessage(number: string, message: string): Promise<void> {
    const formattedNumber = formatPhoneNumber(number);
    await this.client.sendMessage(`${formattedNumber}@c.us`, message);
  }

  public async sendMessageAndPoll(
    names: string[],
    message: string,
    pollQuestion: string,
    pollOptions: string[],
    allowMultipleAnswers: boolean = false,
    messageSecret?: number[]
  ): Promise<void> {
    const contacts = await this.client.getContacts();
    const options: PollSendOptions = {
      allowMultipleAnswers: allowMultipleAnswers,
      messageSecret: messageSecret ?? [],
    };

    for (const name of names) {
      const contact = contacts.find(
        (c) => c.name === name || c.pushname === name || c.shortName === name
      );
      if (contact) {
        await this.client.sendMessage(contact.id._serialized, message);
        //@ts-ignore
        const poll = new Poll(pollQuestion, pollOptions, options);
        await this.client.sendMessage(contact.id._serialized, poll);
      }
    }
  }
}
