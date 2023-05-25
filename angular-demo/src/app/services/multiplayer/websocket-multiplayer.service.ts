import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebsocketMultiplayerService {

  private webSocket?: WebSocket;

  private messageSubject = new ReplaySubject<{code: string, data?: string}>();

  private connection?: LobbyConnection;

  public readonly signalServerUri:string = environment.signalServerUri;

  constructor() { }

  async send(message: string) {
    this.connection?.send(message);
  }

  async canConnect() {
    console.log(`Connecting to ${this.signalServerUri}...`);
    this.webSocket = new WebSocket(this.signalServerUri);
    this.webSocket.onmessage = (event) => this.handleMessage(event);

    return new Promise<boolean>((resolve, reject) => {
      this.webSocket!.onopen = (event) => {
        console.log('Found websocket server');
        this.messageSubject.next({ code: 'checkedSignaling' });
        resolve(true);
      };

      this.webSocket!.onclose = (event) => {
        this.messageSubject.error(JSON.stringify(event));
        resolve(false);
      };
    });
  }

  start(): Observable<{ code: string, data?: string }> {
    if (!this.webSocket) {
      this.webSocket = new WebSocket(this.signalServerUri);
      this.webSocket.onmessage = (event) => this.handleMessage(event);

      this.webSocket.onopen = (event) => {
        console.log('Found websocket server');
        this.messageSubject.next({code: 'checkedSignaling'});
      };

      this.webSocket!.onclose = (event) => {
        console.log('websocket close');
        this.messageSubject.error(JSON.stringify(event));
      };
    }

    this.webSocket.onerror = (event) => {
      console.log(`websocket error: ${JSON.stringify(event)}`);
      this.messageSubject.next({code: 'error', data: JSON.stringify(event)});
    };


    return this.messageSubject.asObservable();
  }

  handleMessage(event: MessageEvent) {
    console.log('new message');
    console.log(event.data);
    const message = event.data.toString('utf8').split('=:=');
    const command = message[0];
    const data = message.slice(1) as string[];
    switch (command) {
      // Host & Client
      case 'userId':
        console.log(`userId=${data[0]}`);
        this.connection?.setUserId(data[0]);
        if (this.connection instanceof HostConnection) {
          this.messageSubject.next({ code: 'joined', data: data[0] });
        }
        break;
      // Host & Client
      case 'lobby':
        console.log('websocket-lobby');
        this.connection?.handleLobbyResponse(data[0]);
        if (this.connection instanceof HostConnection) {
          this.messageSubject.next({ code: 'joined', data: data[0] });
        }
        break;
      // Host
      case 'createoffer':
        this.connection?.handleCreateOfferResponse(this.createCallback(), data[0]);
        break;
      // Client
      case 'createanswer':
        this.connection?.handleCreateAnswerResponse(this.createCallback(), data[0], data[1]);
        this.messageSubject.next({ code: 'joined', data: this.connection?.lobbyCode });
        break;
      // Host
      case 'answer':
        this.connection?.handleAnswerResponse(this.createCallback(), data[0], data[1]);
        break;
      case 'error':
        console.log('error =(');
        break;
    }
  }

  createCallback() {
    let i = 0;
    return (response: string) => {
      if (i++ == 0) {
        this.webSocket?.send(response);
        return;
      }
      console.log(`Called too many times: ${i}`);
    }
  }

  createLobby(lobby: string) {
    this.connection = new HostConnection(this.messageSubject);
    this.webSocket?.send(`create=:=${lobby}`);
  }

  joinLobby(lobby: string) {
    this.connection = new ClientConnection(this.messageSubject);
    this.webSocket?.send(`join=:=${lobby}`);
  }
}

abstract class LobbyConnection {

  protected userId: string = '';

  constructor(protected messageSubject: Subject<{ code: string, data?: string }>) {}

  protected ice = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
    ]
  }

  public lobbyCode = '';

  abstract send(message: string): void;

  setUserId(userId: string) {
    this.userId = userId;
  }

  handleLobbyResponse(lobby: string): void {
    this.lobbyCode = lobby;
  }
  abstract handleCreateOfferResponse(responseCallback: (response: string) => void, user: string): void;
  abstract handleCreateAnswerResponse(responseCallback: (response: string) => void, user: string, sdp: string): void;
  abstract handleAnswerResponse(responseCallback: (response: string) => void, user: string, sdp: string): void;

  protected addIce(event: RTCPeerConnectionIceEvent, connection?: RTCPeerConnection): boolean {
    console.log(event);
    if (event.candidate) {
      return false;
    }

    return true;
  }
}

class HostConnection extends LobbyConnection {
  usersInLobby: { [key: string]: { connection: RTCPeerConnection, channel?: RTCDataChannel } } = {};

  send(message: string) {
    Object.keys(this.usersInLobby).map(key => this.usersInLobby[key]).forEach(user => user.channel?.send(message));
  }

  handleCreateOfferResponse(responseCallback: (response: string) => void, user: string): void {
    console.log('connecting to peer');
    const userConnection = new RTCPeerConnection(this.ice);
    const userChannel = userConnection.createDataChannel('Lobby', { ordered: true });
    userChannel.onopen = (event) => {
      console.log('connected to client');
      this.messageSubject.next({code: 'connected'});
    }
    userChannel.onmessage = evMessage => {
      console.log('RTC connected');
      this.messageSubject.next({code: 'rtc', data: evMessage.data });
    }
    userChannel.onclose = event => {
      console.log('close RTC');
      this.messageSubject.complete();
    };
    this.usersInLobby[user] = { connection: userConnection, channel: userChannel };
    userConnection.onicecandidate = async evt => {
      if (this.addIce(evt, userConnection)) {
        console.log('sending offer');
        responseCallback(`offer=:=${user}=:=${userConnection.localDescription?.sdp}`);
      }
    }
    userConnection.createOffer().then(sessionInit => userConnection.setLocalDescription(sessionInit));
    console.log('waiting for ice');
  }

  handleCreateAnswerResponse(responseCallback: (response: string) => void, user: string, sdp: string): void {
    throw new Error('Method not implemented.');
  }

  handleAnswerResponse(responseCallback: (response: string) => void, user: string, sdp: string): void {
    this.usersInLobby[user].connection.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: sdp }));
  }
}

class ClientConnection extends LobbyConnection {

  private connection: RTCPeerConnection = new RTCPeerConnection(this.ice);
  private channel?: RTCDataChannel;

  send(message: string) {
    this.channel?.send(message);
  }
  
  handleCreateOfferResponse(responseCallback: (response: string) => void, user: string): void {
    throw new Error('Method not implemented.');
  }

  handleCreateAnswerResponse(responseCallback: (response: string) => void, user: string, sdp: string): void {
    this.connection.ondatachannel = (event) => {
      event.channel.onopen = (evt) => {
        console.log('connected to host');
        this.messageSubject.next({ code: 'connected'});
      }
      event.channel.onmessage = evMessage => {
        console.log('RTC connected');
        this.messageSubject.next({ code: 'rtc', data: evMessage.data });
      }
      event.channel.onclose = event => {
        console.log('close RTC');
        this.messageSubject.complete();
      };
      this.channel = event.channel;
    }
    this.connection.onicecandidate = async evt => {
      if (this.addIce(evt, this.connection)) {
        console.log('sending answer');
        responseCallback(`answer=:=${user}=:=${this.connection.localDescription?.sdp}`);
      }
    }
    this.connection.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp: sdp }))
      .then(() => this.connection.createAnswer()).then(sessionInit => this.connection.setLocalDescription(sessionInit));
    console.log('waiting for ice');
  }

  handleAnswerResponse(responseCallback: (response: string) => void, user: string, sdp: string): void {
    throw new Error('Method not implemented.');
  }

}