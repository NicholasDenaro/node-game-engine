import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.less']
})
export class LobbyComponent {

  isLobby = true;
  isHosting = false;
  code = '';

  isConnected = false;

  username: string = '';
  remoteUsername: string = '';
  userRegex = /ice-ufrag:(?<username>[0-9a-f]+)/;

  @ViewChild('textarea')
  codeTextBox: ElementRef | undefined;

  @ViewChild('chatBox')
  chatBox: ElementRef | undefined;;

  @ViewChild('messageBox')
  messageBox: ElementRef | undefined;

  private ice = {
    iceServers: [
      {
        urls: 'stun:stun.l.google.com:19302'
      }
  ]
}
  private connection: RTCPeerConnection = new RTCPeerConnection(this.ice);
  private channel: RTCDataChannel | null = null;

  async host() {
    this.isLobby = false;
    this.isHosting = true;
    this.connection.oniceconnectionstatechange = e => console.log(this.connection?.iceConnectionState);
    this.channel = this.connection.createDataChannel('Lobby', { ordered: true });
    this.channel.onopen =  event => {
      console.log('open');
      this.isConnected = true;
    };
    this.channel.onmessage = evMessage => {
      if (this.chatBox) {
        this.chatBox.nativeElement.value += `remote: ${evMessage.data}\n`;
      }
    }
    this.channel.onclose = event => {
      console.log('close');
      this.close();
    };
    this.connection.onicecandidate = this.addIce.bind(this);
    const sessionInit: RTCSessionDescriptionInit = await this.connection.createOffer();
    await this.connection.setLocalDescription(sessionInit);
  }

  copy() {
    navigator.clipboard.writeText(this.code);
  }

  async join() {
    this.isLobby = false;
    this.isHosting = false;
  }

  async answer() {
    this.connection.onnegotiationneeded = e => console.log(e);
    this.connection.oniceconnectionstatechange = e => console.log(this.connection?.iceConnectionState);
    this.connection.onicecandidate = this.addIce.bind(this);
    this.remoteUsername = this.userRegex.exec(this.codeTextBox?.nativeElement.value)?.groups?.['username'] || '';
    await this.connection.setRemoteDescription(new RTCSessionDescription({type: 'offer', sdp: this.codeTextBox?.nativeElement.value}));
    this.connection.ondatachannel = (event) => {
      this.channel = event.channel;
      this.channel.onopen =  event => {
        console.log('open');
        this.isConnected = true;
      };
      this.channel.onclose = event => {
        console.log('close');
        this.close();
      };
      this.channel.onmessage = evMessage => {
        if (this.chatBox) {
          this.chatBox.nativeElement.value += `host: ${evMessage.data}\n`;
        }
      }
    }
    const sessionInit: RTCSessionDescriptionInit = await this.connection.createAnswer();
    
    await this.connection.setLocalDescription(sessionInit);
    
  }

  close() {
    this.isConnected = false;
    this.code = '';
    this.isHosting = false;
    this.isLobby = true;
    this.connection.close();
    this.connection = new RTCPeerConnection(this.ice);
    this.channel?.close();
    this.channel = null;
  }

  async connect() {
    if (this.connection) {
      await this.connection.setRemoteDescription(new RTCSessionDescription({type: 'answer', sdp:this.codeTextBox?.nativeElement.value}));
    }
  }

  back() {
    this.isLobby = true;
    this.isHosting = false;
  }

  private async addIce(event: RTCPeerConnectionIceEvent) {
    if (event.candidate) {
      return;
    }
    this.code = this.connection?.localDescription?.sdp || '';
    this.username = this.userRegex.exec(this.code)?.groups?.['username'] || '';

    return;
  }

  async sendChat() {
    if (this.messageBox) {
      const message = this.messageBox.nativeElement.value;
      await this.channel?.send(message);
      if (this.chatBox) {
        this.chatBox.nativeElement.value += `self: ${message}\n`;
      }
      this.messageBox.nativeElement.value = '';
    }
  }
}
