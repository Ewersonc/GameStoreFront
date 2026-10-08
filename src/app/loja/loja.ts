import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Header } from '../header/header';
import { Carrinho } from '../carrinho/carrinho';
import { CarrinhoService } from '../services/carrinho.service';
import { Jogo, JogosService } from '../services/jogos.service';

@Component({
  selector: 'app-loja',
  imports: [Header, Carrinho, CurrencyPipe],
  templateUrl: './loja.html',
  styleUrl: './loja.css',
})
export class Loja implements OnInit {
  private jogosService = inject(JogosService);
  protected carrinho = inject(CarrinhoService);

  protected jogos = signal<Jogo[]>([]);
  protected carregando = signal(true);
  protected erro = signal<string | null>(null);
  protected capasComFalha = signal<ReadonlySet<string>>(new Set<string>());

  ngOnInit(): void {
    this.carrinho.carregar();
    this.carregarJogos();
  }

  carregarJogos(): void {
    this.carregando.set(true);
    this.erro.set(null);
    this.capasComFalha.set(new Set<string>());

    this.jogosService.listar().subscribe({
      next: (jogos) => {
        this.jogos.set(jogos);
        this.carregando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.carregando.set(false);
        this.erro.set(
          err.status === 0
            ? 'Não foi possível conectar ao servidor. Verifique se o backend está rodando.'
            : 'Não foi possível carregar os jogos.'
        );
        console.error(err);
      },
    });
  }

  protected urlCapa(jogo: Jogo): string | null {
    return this.capasComFalha().has(jogo.id) ? null : this.jogosService.urlCapa(jogo);
  }

  protected aoFalharCapa(jogo: Jogo): void {
    this.capasComFalha.update((conjunto) => new Set(conjunto).add(jogo.id));
  }

  protected capa(jogo: Jogo): string {
    let matiz = 0;
    for (const letra of jogo.genero) {
      matiz = (matiz * 31 + letra.charCodeAt(0)) % 360;
    }
    return `linear-gradient(135deg, hsl(${matiz} 55% 32%), hsl(${(matiz + 40) % 360} 60% 12%))`;
  }

  protected sigla(jogo: Jogo): string {
    const ignoradas = ['the', 'of', 'a', 'an'];
    return jogo.nome
      .split(/\s+/)
      .filter((palavra) => !ignoradas.includes(palavra.toLowerCase()))
      .slice(0, 2)
      .map((palavra) => palavra.charAt(0))
      .join('')
      .toUpperCase();
  }
}
