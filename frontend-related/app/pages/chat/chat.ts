import { Component, OnInit, OnDestroy, inject, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, Mensagem } from '../../services/chat.service';
import { Subject, interval } from 'rxjs';
import { takeUntil, switchMap, startWith, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tcc-chat-container" style="display: flex; flex-direction: column; height: 600px; max-height: 80vh; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">

      <!-- Header -->
      <div style="padding: 16px; background: white; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; gap: 12px;">
        <div style="width: 40px; height: 40px; border-radius: 50%; background: #3b82f6; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold;">
          AT
        </div>
        <div>
          <h3 style="margin: 0; font-size: 16px; color: #0f172a;">Suporte Técnico</h3>
          <span style="font-size: 12px; color: #10b981;">● Online</span>
        </div>
      </div>

      <!-- Messages Area -->
      <div #scrollContainer style="flex: 1; padding: 16px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px;">
        @for (msg of mensagens; track msg.id) {
          <div [ngStyle]="{'align-self': msg.remetenteId === meuUsuarioId ? 'flex-end' : 'flex-start'}"
               style="max-width: 70%; padding: 12px 16px; border-radius: 12px; font-size: 14px; position: relative;"
               [ngClass]="msg.remetenteId === meuUsuarioId ? 'bg-blue' : 'bg-white'">
            <div style="margin-bottom: 4px; font-size: 11px; opacity: 0.7; font-weight: 600;">
              {{ msg.remetenteNome }}
            </div>
            <div>{{ msg.texto }}</div>
            <div style="margin-top: 4px; font-size: 10px; opacity: 0.5; text-align: right;">
              {{ formatTime(msg.dataEnvio) }}
            </div>
          </div>
        }
      </div>

      <!-- Input Area -->
      <div style="padding: 16px; background: white; border-top: 1px solid #e2e8f0; display: flex; gap: 8px;">
        <input type="text" [(ngModel)]="novaMensagem" (keyup.enter)="enviar()" placeholder="Digite sua mensagem..."
               style="flex: 1; padding: 12px 16px; border: 1px solid #cbd5e1; border-radius: 24px; outline: none; font-size: 14px;" />
        <button (click)="enviar()" [disabled]="!novaMensagem.trim()"
                style="width: 44px; height: 44px; border-radius: 50%; border: none; background: #3b82f6; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center;">
          <i class="pi pi-send"></i>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .bg-blue { background-color: #3b82f6; color: white; border-bottom-right-radius: 4px !important; }
    .bg-white { background-color: white; color: #333; border: 1px solid #e2e8f0; border-bottom-left-radius: 4px !important; }
  `]
})
export class ChatComponent implements OnInit, OnDestroy {
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  private chatService = inject(ChatService);
  private destroy$ = new Subject<void>();

  ticketId = 'TICKET-123'; // TODO: Get this from route params
  meuUsuarioId = 'meu-id'; // TODO: Get this from AuthService

  mensagens: Mensagem[] = [];
  novaMensagem = '';

  ngOnInit() {
    // POLLING MECHANISM: Fetch every 3 seconds
    interval(3000).pipe(
      startWith(0), // Trigger immediately on load
      switchMap(() => this.chatService.getMensagens(this.ticketId).pipe(
        catchError(err => {
          console.error('Chat polling error', err);
          return of([]); // Don't break the loop on error
        })
      )),
      takeUntil(this.destroy$) // Prevent memory leaks on destroy
    ).subscribe(msgs => {
      const isNewMessage = msgs.length > this.mensagens.length;
      this.mensagens = msgs;
      if (isNewMessage) {
        setTimeout(() => this.scrollToBottom(), 100);
      }
    });
  }

  enviar() {
    if (!this.novaMensagem.trim()) return;

    const texto = this.novaMensagem;
    this.novaMensagem = ''; // Clear input immediately for UX

    this.chatService.enviarMensagem(this.ticketId, texto).subscribe(novaMsg => {
      // Optimistically push to array so user sees it instantly before next poll
      this.mensagens.push(novaMsg);
      setTimeout(() => this.scrollToBottom(), 100);
    });
  }

  scrollToBottom() {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch(err) { }
  }

  formatTime(isoString: string): string {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  ngOnDestroy() {
    // Critical: Stop the polling interval when leaving the page
    this.destroy$.next();
    this.destroy$.complete();
  }
}