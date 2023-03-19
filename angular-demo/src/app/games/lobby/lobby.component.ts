import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebsocketMultiplayerService } from 'src/app/services/multiplayer/websocket-multiplayer.service';
import { ManualMultiplayerService } from 'src/app/services/multiplayer/manual-multiplayer.service';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.less']
})
export class LobbyComponent implements OnInit {

  isLobby = true;
  isHosting = false;
  code = '';

  isConnected = false;
  isManual = false;
  isCheckingSignalServer = true;
  inRoom = false;

  username: string = '';
  remoteUsername: string = '';

  userKeys: string[] = [];

  @ViewChild('textarea')
  codeTextBox: ElementRef | undefined;

  @ViewChild('chatBox')
  chatBox: ElementRef | undefined;;

  @ViewChild('messageBox')
  messageBox: ElementRef | undefined;

  constructor(private webSocket: WebsocketMultiplayerService, private manual: ManualMultiplayerService) {

  }

  async ngOnInit(): Promise<void> {
    if (await this.webSocket.canConnect()) {
      this.isManual = false;
      this.isCheckingSignalServer = false;
      return;
    }
    this.isManual = true;
    this.isCheckingSignalServer = false;
  }

  async host() {
    this.isLobby = false;
    this.isHosting = true;

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    }
    catch (e) {}

    if (this.isManual) {
      this.manual.start().subscribe(info => this.handleMessage(info));
      this.manual.createOffer();
    }

    if (!this.isManual) {
      this.webSocket.start().subscribe(info => this.handleMessage(info));
    }
  }

  copy() {
    navigator.clipboard.writeText(this.code);
  }

  async join() {
    this.isLobby = false;
    this.isHosting = false;

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    }
    catch (e) { }

    if (!this.isManual) {
      this.webSocket.start().subscribe(info => this.handleMessage(info));
    }
  }

  handleMessage(info: {code: string, data?: string}) {
    if (info.code == 'checkedSignaling') {
      this.isCheckingSignalServer = false;
    }
    if (info.code == 'error') {
      this.isManual = true;
    }
    if (info.code == 'code') {
      this.code = info.data || '';
    }
    if (info.code == 'joined') {
      this.inRoom = true;
      this.code = info.data || '';
    }
    if (info.code == 'connected') {
      this.isConnected = true;
    }
    if (info.code == 'rtc') {
      this.chatBox!.nativeElement.value += `${info.data}\n`;
    }
  }

  async connect() {
    if (this.isManual) {
      await this.manual.submitAnswer(this.codeTextBox?.nativeElement.value);
    }

    if (!this.isManual) {
      console.log('joining lobby...');
      await this.webSocket.joinLobby(this.codeTextBox?.nativeElement.value);
    }
  }

  createLobby() {
    this.webSocket.createLobby(this.codeTextBox?.nativeElement.value);
  }

  answer() {
    if (this.isManual) {
      this.manual.start().subscribe(info => this.handleMessage(info));
      this.manual.createAnswer(this.codeTextBox?.nativeElement.value);
    }
  }

  back() {
    this.isLobby = true;
    this.isHosting = false;
  }

  async sendChat() {
    if (this.messageBox) {
      const message = this.messageBox.nativeElement.value;
      if (this.isManual) {
        await this.manual?.send(message);
      }
      else {
        await this.webSocket?.send(message);
        
      }
      if (this.chatBox) {
        this.chatBox.nativeElement.value += `self: ${message}\n`;
        this.chatBox.nativeElement.scrollTop = this.chatBox.nativeElement.scrollHeight;
      }
      this.messageBox.nativeElement.value = '';
    }
  }
}
