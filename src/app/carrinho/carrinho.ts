import { Component, HostListener, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { CarrinhoService } from '../services/carrinho.service';

@Component({
  selector: 'app-carrinho',
  imports: [CurrencyPipe],
  templateUrl: './carrinho.html',
  styleUrl: './carrinho.css',
})
export class Carrinho {
  protected carrinho = inject(CarrinhoService);

  protected enviando = signal(false);
  protected erro = signal<string | null>(null);
  protected pedidoCriado = signal<string | null>(null);

  @HostListener('document:keydown.escape')
  aoApertarEsc(): void {
    this.fechar();
  }

  protected codigoPedido(id: string): string {
    return id.slice(-6).toUpperCase();
  }

  fechar(): void {
    this.carrinho.fechar();
    this.erro.set(null);
    this.pedidoCriado.set(null);
  }

  finalizar(): void {
    this.erro.set(null);
    this.enviando.set(true);

    this.carrinho.finalizar().subscribe({
      next: (pedido) => {
        this.enviando.set(false);
        this.pedidoCriado.set(pedido.id);
      },
      error: (err) => {
        this.enviando.set(false);
        this.erro.set('Não foi possível finalizar o pedido. Tente novamente.');
        console.error(err);
      },
    });
  }
}
