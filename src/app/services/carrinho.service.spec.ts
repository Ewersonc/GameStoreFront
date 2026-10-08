import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { CarrinhoService } from './carrinho.service';
import { Jogo } from './jogos.service';
import { API_URL } from '../config/api';

function jogo(id: string, valor: number): Jogo {
  return {
    id,
    nome: `Jogo ${id}`,
    genero: 'RPG',
    sinopse: 'Sinopse',
    desenvolvedor: 'Dev',
    anoLancamento: 2020,
    valor,
    imagemCapa: null,
  };
}

describe('CarrinhoService', () => {
  let service: CarrinhoService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('gamestore.usuario', JSON.stringify({ id: 'u7', nome: 'Ana', email: 'ana@teste.com' }));

    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CarrinhoService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('adiciona jogos e calcula o total sem erro de ponto flutuante', () => {
    service.adicionar(jogo('a', 0.1));
    service.adicionar(jogo('b', 0.2));

    expect(service.quantidade()).toBe(2);
    expect(service.total()).toBe(0.3);
  });

  it('não adiciona o mesmo jogo duas vezes', () => {
    service.adicionar(jogo('a', 10));
    service.adicionar(jogo('a', 10));

    expect(service.quantidade()).toBe(1);
    expect(service.contem('a')).toBe(true);
  });

  it('remove jogos', () => {
    service.adicionar(jogo('a', 10));
    service.adicionar(jogo('b', 20));
    service.remover('a');

    expect(service.itens().map((j) => j.id)).toEqual(['b']);
  });

  it('mantém o carrinho salvo no navegador (por usuário)', () => {
    service.adicionar(jogo('a', 10));
    expect(localStorage.getItem('gamestore.carrinho.u7')).not.toBeNull();

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const novo = TestBed.inject(CarrinhoService);
    expect(novo.quantidade()).toBe(0);

    novo.carregar();
    expect(novo.itens().map((j) => j.id)).toEqual(['a']);
  });

  it('finalizar envia o pedido ao backend e esvazia o carrinho', () => {
    service.adicionar(jogo('a', 79.9));
    service.adicionar(jogo('b', 19.99));

    let pedidoId: string | undefined;
    service.finalizar().subscribe((pedido) => (pedidoId = pedido.id));

    const req = http.expectOne(`${API_URL}/pedidos`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ cliente: 'Ana', valorTotal: 99.89, status: 'PENDENTE' });
    req.flush({ id: 'p42', cliente: 'Ana', valorTotal: 99.89, status: 'PENDENTE' });

    expect(pedidoId).toBe('p42');
    expect(service.quantidade()).toBe(0);
  });

  it('finalizar com carrinho vazio dá erro e não chama o backend', () => {
    let erro: unknown;
    service.finalizar().subscribe({ error: (e) => (erro = e) });

    expect(erro).toBeInstanceOf(Error);
    http.expectNone(`${API_URL}/pedidos`);
  });
});
