import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ManualMultiplayerService {
  iceCode = '';
  ice = {
    iceServers: [
      {
        urls: 'stun:stun.l.google.com:19302'
      }
    ]
  }
  connection?: RTCPeerConnection;
  channel?: RTCDataChannel;

  private messageSubject = new Subject<{code: string, data?: string}>();

  constructor() { }

  send(message: string) {
    this.channel?.send(message);
  }

  start(): Observable<{ code: string, data?: string }> {
    this.connection = new RTCPeerConnection(this.ice);
    this.connection.onnegotiationneeded = e => console.log(e);
    this.connection.oniceconnectionstatechange = e => console.log(this.connection?.iceConnectionState);
    this.connection.onicecandidate = this.addIce.bind(this);
    return this.messageSubject.asObservable();
  }

  async createOffer() {
    if (!this.connection) {
      return;
    }

    this.channel = this.connection.createDataChannel('Lobby', { ordered: true });
    this.channel.onopen = event => {
      console.log('open');
      this.messageSubject.next({ code: 'connected' });
    };
    this.channel.onmessage = evMessage => {
      this.messageSubject.next({ code: 'rtc', data: evMessage.data });
    }
    this.channel.onclose = event => {
      console.log('close');
      this.messageSubject.complete();
    };
    let sessionInit = await this.connection.createOffer();
    await this.connection.setLocalDescription(sessionInit);
  }

  async createAnswer(sdp: string) {
    if (!this.connection) {
      return;
    }

    await this.connection.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp: sdp }));
    this.connection.ondatachannel = (event) => {
      this.channel = event.channel;
      this.channel.onopen = event => {
        console.log('open');
        this.messageSubject.next({code: 'connected'});
      };
      this.channel.onclose = event => {
        console.log('close');
        this.messageSubject.complete();
      };
      this.channel.onmessage = evMessage => {
        this.messageSubject.next({ code: 'rtc', data: evMessage.data });
      }
    }

    const sessionInit: RTCSessionDescriptionInit = await this.connection.createAnswer();

    this.connection.setLocalDescription(sessionInit);
  }

  async submitAnswer(sdp: string) {
    if (!this.connection) {
       return;
    }

    await this.connection.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: sdp }));
  }

  addIce(event: RTCPeerConnectionIceEvent): boolean {
    if (event.candidate) {
      return false;
    }

    this.iceCode = this.connection?.localDescription?.sdp || '';
    this.messageSubject.next({code: 'code', data: this.iceCode});

    return true;
  }
}
