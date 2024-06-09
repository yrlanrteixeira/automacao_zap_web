export interface CreateGroupRequest {
  groupName: string;
  names: string[];
  description?: string;
  admins?: string[];
  setInfoAdminsOnly?: boolean;
}

export interface CreateMultipleGroupsRequest {
  groupNames: string[];
  names: string[];
  minInterval: number;
  maxInterval: number;
  description?: string;
  admins?: string[];
  setInfoAdminsOnly?: boolean;
}

export interface SendMessageAndPoll {
  names: string[];
  message: string;
  pollQuestion: string;
  pollOptions: string[];
  allowMultipleAnswers?: boolean;
  messageSecret?: number[];
}

export interface SendMessagesRequest {
  names: string[];
  message: string;
}

export interface SendMessageQuery {
  number: string;
  message: string;
}

export interface SendPollRequest {
  names: string[];
  pollQuestion: string;
  pollOptions: string[];
  allowMultipleAnswers?: boolean;
  messageSecret?: number[];
}
