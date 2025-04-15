import { ChatRepository } from "./chat.repo";

export interface IChatService {}

export class ChatService implements IChatService {
  constructor(private readonly chatRepository: ChatRepository) {}


}

