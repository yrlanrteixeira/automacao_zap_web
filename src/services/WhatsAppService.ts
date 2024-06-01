import { Client, Poll, PollSendOptions } from "whatsapp-web.js";

interface Contact {
  name: string;
  number: string;
  message?: string;
}

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
    names: string[]
  ): Promise<void> {
    const contacts = await this.client.getContacts();
    const participantIds = names
      .map((name) => {
        const contact = contacts.find(
          (c) => c.name === name || c.pushname === name || c.shortName === name
        );
        return contact ? contact.id._serialized : null;
      })
      .filter((id) => id !== null);

    if (participantIds.length > 0) {
      await this.client.createGroup(groupName, participantIds);
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
}
