import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, throwError } from 'rxjs';
import { API_URL } from '../config/api';
import { AuthService } from './auth.service';
import { Jogo } from './jogos.service';

export interface Pedido {
  id: string;
  cliente: string;
  valorTotal: number;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class CarrinhoService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private readonly _itens = signal<Jogo[]>([]);

  readonly itens = this._itens.asReadonly();
  readonly quantidade = computed(() => this._itens().length);
  readonly total = computed(() =>
    Math.round(this._itens().reduce((soma, jogo) => soma + jogo.valor, 0) * 100) / 100
  );

  readonly aberto = signal(false);

  carregar(): void {
    this._itens.set(this.lerSalvo());
  }

  contem(id: string): boolean {
    return this._itens().some((jogo) => jogo.id === id);
  }

  adicionar(jogo: Jogo): void {
    if (this.contem(jogo.id)) {
      return;
    }
    this._itens.update((itens) => [...itens, jogo]);
    this.salvar();
  }

  remover(id: string): void {
    this._itens.update((itens) => itens.filter((jogo) => jogo.id !== id));
    this.salvar();
  }

  limpar(): void {
    this._itens.set([]);
    this.salvar();
  }

  abrir(): void {
    this.aberto.set(true);
  }

  fechar(): void {
    this.aberto.set(false);
  }

  alternar(): void {
    this.aberto.update((valor) => !valor);
  }

  finalizar(): Observable<Pedido> {
    const usuario = this.auth.usuario();
    if (!usuario || this._itens().length === 0) {
      return throwError(() => new Error('Carrinho vazio ou usuário não autenticado'));
    }

    const pedido = {
      cliente: usuario.nome,
      valorTotal: this.total(),
      status: 'PENDENTE'
    };

    return this.http.post<Pedido>(`${API_URL}/pedidos`, pedido).pipe(
      tap(() => this.limpar())
    );
  }

  private chave(): string | null {
    const usuario = this.auth.usuario();
    return usuario ? `gamestore.carrinho.${usuario.id}` : null;
  }

  private salvar(): void {
    const chave = this.chave();
    if (chave) {
      localStorage.setItem(chave, JSON.stringify(this._itens()));
    }
  }

  private lerSalvo(): Jogo[] {
    const chave = this.chave();
    if (!chave) {
      return [];
    }
    try {
      const bruto = localStorage.getItem(chave);
      const dados: unknown = bruto ? JSON.parse(bruto) : [];
      return Array.isArray(dados) ? (dados as Jogo[]) : [];
    } catch {
      return [];
    }
  }
}
