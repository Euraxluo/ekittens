import {
  ConnectedSocket,
  MessageBody,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import {nanoid} from "nanoid";
import {Server, Socket} from "socket.io";

import {ack, WsService} from "@lib/ws";
import {User} from "@modules/user";
import {JoinChatDto, SendMessageDto} from "./dtos";
import {events} from "./lib/events";

const room = {
  prefix: "chat",
};

@WebSocketGateway()
export class ChatGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;
  private service: WsService;

  async afterInit(server: Server) {
    console.log('[ChatGateway] Initializing with server:', {
      hasServer: !!server,
      adapter: !!server?.adapter,
    });
    this.service = new WsService(server);
  }

  @SubscribeMessage(events.server.JOIN_CHAT)
  joinChat(@ConnectedSocket() socket: Socket, @MessageBody() dto: JoinChatDto) {
    console.log(`[ChatGateway] User ${socket.request.session.user.id} joining chat ${dto.chatId}`);
    const chatId = `${room.prefix}:${dto.chatId}`;
    socket.join(chatId);

    this.service.setupDisconnectHandler(
      socket,
      socket.request.session.user.id,
      () => {
        console.log(`[ChatGateway] User ${socket.request.session.user.id} leaving chat ${dto.chatId}`);
        socket.leave(chatId);
      },
      `chat:${chatId}`
    );

    return ack({ok: true});
  }

  @SubscribeMessage(events.server.SEND_MESSAGE)
  sendMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() dto: SendMessageDto,
  ) {
    const message = {
      id: nanoid(),
      text: dto.text,
      sender: User.create(socket.request.session.user).public,
      createdAt: Date.now(),
    };

    this.server.to(dto.chatId).emit(events.client.NEW_MESSAGE, {message});

    return ack({ok: true});
  }
}
