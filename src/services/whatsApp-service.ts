import { Client, GroupChat, ChatId, MessageMedia } from "whatsapp-web.js";
import { randomInt } from "crypto";

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
        (contact) =>
          contact.name === name && contact.id._serialized.endsWith("@c.us")
      );
      if (contact) {
        const chat = await this.client.getChatById(contact.id._serialized);
        await chat.sendMessage(message);
        console.log(`Message sent to ${name}`);
      }
    }
  }

  public async listContacts(): Promise<any[]> {
    const contacts = await this.client.getContacts();
    return contacts.map((contact) => ({
      name: contact.name,
      pushname: contact.pushname,
      shortName: contact.shortName,
      id: contact.id._serialized,
    }));
  }

  public async createGroupByName(
    groupName: string,
    names: string[],
    description?: string,
    admins?: string[],
    photoPath?: string,
    setInfoAdminsOnly?: boolean
  ): Promise<string> {
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

        if (setInfoAdminsOnly) {
          await groupChat.setInfoAdminsOnly(true);
          console.log(`Info admins only set for group ${groupName}`);
        }

        if (description) {
          try {
            await groupChat.setDescription(description);
            console.log(`Description set for group ${groupName}`);
          } catch (error) {
            console.error(
              `Failed to set description for group ${groupName}: ${error}`
            );
          }
        }

        if (admins && admins.length > 0) {
          const adminIds = await this.findContactsByName(admins);
          await groupChat.promoteParticipants(
            adminIds.map((id) => id._serialized)
          );
          console.log(`Admins promoted for group ${groupName}`);
        }

        if (photoPath) {
          try {
            const media = MessageMedia.fromFilePath(photoPath);
            await groupChat.setPicture(media);
            console.log(`Photo set for group ${groupName}`);
          } catch (error) {
            console.error(
              `Failed to set photo for group ${groupName}: ${error}`
            );
          }
        }
        console.log(`Group ID: ${groupResult.gid._serialized}`);
        return groupResult.gid._serialized;
      } else {
        console.log(`Error creating group: ${groupResult}`);
      }
    } else {
      console.log(`No valid participants found for group: ${groupName}`);
    }
    return "";
  }

  public async createMultipleGroups(
    groupNames: string[],
    names: string[],
    minInterval: number,
    maxInterval: number,
    description?: string,
    admins?: string[]
  ): Promise<void> {
    for (const groupName of groupNames) {
      const interval = randomInt(minInterval, maxInterval);
      await new Promise((resolve) => setTimeout(resolve, interval));
      await this.createGroupByName(groupName, names, description, admins);
    }
  }

  public async createGroupsAndSendMessages(data: any[]): Promise<void> {
    const participantsMap = new Map<string, string[]>();
    const descriptionMap = new Map<string, string>();
    const adminsMap = new Map<string, string[]>();

    for (const groupData of data) {
      const { pessoa, descricao, evento, respoGET, planejador } = groupData;

      if (!participantsMap.has(evento)) {
        participantsMap.set(evento, []);
      }
      participantsMap.get(evento)!.push(pessoa);

      if (descricao) {
        descriptionMap.set(evento, descricao);
      }

      if (respoGET || planejador) {
        if (!adminsMap.has(evento)) {
          adminsMap.set(evento, []);
        }
        if (respoGET) adminsMap.get(evento)!.push(respoGET);
        if (planejador) adminsMap.get(evento)!.push(planejador);
      }
    }

    for (const [evento, participantes] of participantsMap) {
      const descricao = descriptionMap.get(evento);
      const admins = adminsMap.get(evento);
      const photoPath = "src/assets/Logo_junino.png";

      const groupId = await this.createGroupByName(
        evento,
        participantes,
        descricao,
        admins,
        photoPath
      );

      if (groupId) {
        await new Promise((resolve) => setTimeout(resolve, 5000));

        for (const groupData of data.filter((gd) => gd.evento === evento)) {
          const { mensagem1, mensagem2, mensagem3, mensagem4 } = groupData;
          const mensagens = [mensagem1, mensagem2, mensagem3, mensagem4];

          for (const mensagem of mensagens) {
            if (mensagem) {
              try {
                console.log(`Sending message: ${mensagem}`);
                await this.sendGroupMessage(groupId, mensagem);
                console.log(`Message sent: ${mensagem}`);
              } catch (error) {
                console.error(
                  `Failed to send message: ${mensagem}. Error: ${error}`
                );
              }
            }
          }
        }
        console.log(`Messages sent for group: ${evento}`);
      }
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
    const options = {
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
    const options = {
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

  public async sendGroupMessage(
    groupId: string,
    message: string
  ): Promise<void> {
    try {
      await this.client.sendMessage(groupId, message);
      console.log(`Message sent to group ${groupId}`);
    } catch (error) {
      console.error(`Failed to send message to group ${groupId}: ${error}`);
    }
  }
}
