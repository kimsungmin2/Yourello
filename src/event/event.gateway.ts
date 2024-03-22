import { SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@WebSocketGateway({
  namespace: 'event',
  cors: {
    origin: '*',

    credentials: true,
  },
})
export class EventGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor() {}

  @SubscribeMessage('join')
  async handleJoinMessage(client: Socket, roomId: string) {
    console.log('gg');
    console.log(roomId);
    client.join(roomId);
    client.broadcast.to(roomId).emit('enter', { userId: client.id });
  }

  @SubscribeMessage('offer')
  handleOfferMessage(client: Socket, { offer, selectedRoom }) {
    console.log('gg');
    client.broadcast.to(selectedRoom).emit('offer', { userId: client.id, offer });
  }

  @SubscribeMessage('answer')
  handleAnswerMessage(client: Socket, { answer, selectedRoom }) {
    client.broadcast.to(selectedRoom).emit('answer', {
      userId: client.id,
      answer,
    });
  }

  @SubscribeMessage('message')
  handleMessage(client: Socket, { roomId, message }): void {
    // 받은 메시지를 방의 다른 클라이언트들에게 전달
    console.log(roomId);
    console.log(message);
    client.broadcast.to(roomId).emit('message', {
      userId: client.id,
      message,
    });
    console.log(client.id);
  }
  @SubscribeMessage('start')
  startScreenSharing(client: Socket): void {
    client.emit('startScreenSharing');
  }
  @SubscribeMessage('startScreenSharing')
  handleStartScreenSharing(client: Socket) {
    this.startScreenSharing(client);
  }
  @SubscribeMessage('userConnect')
  handleConnection(client: Socket) {
    const request = client.request;
    const cookies = request.headers.cookie;
    console.log(cookies);
    // console.log('안녕하세요');
    console.log(`Client connected: ${client.id}`);
    console.log(`Cookies: ${cookies}`);
  }
  @SubscribeMessage('userDisconnect')
  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('icecandidate')
  handleIcecandidateMessage(client: Socket, { candidate, selectedRoom }) {
    console.log('됐나?');
    client.broadcast.to(selectedRoom).emit('icecandidate', {
      userId: client.id,
      candidate,
    });
  }
}
