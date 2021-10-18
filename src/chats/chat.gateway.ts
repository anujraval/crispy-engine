import { Logger } from '@nestjs/common';
import {
	WebSocketGateway,
	SubscribeMessage,
	MessageBody,
	OnGatewayInit,
	OnGatewayConnection,
	OnGatewayDisconnect,
	WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { ChatTypes } from './entities/chat.types';

const socketRoute = '/api/chat';

@WebSocketGateway(6789, { transports: ['websocket'], namespace: socketRoute, path: socketRoute })
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer() server: Server;

	constructor(private readonly chatService: ChatService) {}

	private logger: Logger = new Logger('ChatGateway');

	afterInit(server: Server) {
		this.logger.log(`Initialized -`);
	}

	handleDisconnect(client: Socket) {
		this.logger.log(`Client disconnected: ${client.id}`);
	}

	handleConnection(client: Socket, ...args: unknown[]) {
		this.logger.log(`Client connected: ${client.id}`);
	}

	/* CRUD Operations START */
	create(@MessageBody() createChatDto: CreateChatDto) {
		return this.chatService.create(createChatDto);
	}

	findAll() {
		return this.chatService.findAll();
	}

	findOne(@MessageBody() id: number) {
		return this.chatService.findOne(id);
	}

	update(@MessageBody() updateChatDto: UpdateChatDto) {
		return this.chatService.update(updateChatDto.id, updateChatDto);
	}

	remove(@MessageBody() id: number) {
		return this.chatService.remove(id);
	}
	/* CRUD Operations END */

	/* Socket Events */
	@SubscribeMessage(ChatTypes.onMessage)
	onMessage(client: Socket, data: string): string {
		this.logger.log(`Client message: ${client.id}, ${data}`);
		this.server.emit(ChatTypes.message, data);
		return data;
	}
}
