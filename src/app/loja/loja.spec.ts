import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { Loja } from './loja';
import { Jogo } from '../services/jogos.service';
import { API_URL } from '../config/api';

function criarJogos(quantidade: number): Jogo[] {
  return Array.from({ length: quantidade }, (_, i) => ({
    id: `id${i + 1}`,
    nome: `Jogo ${i + 1}`,
    genero: 'RPG',
    sinopse: 'Sinopse do jogo',
    desenvolvedor: 'Dev',
    anoLancamento: 2020,
    valor: 50 + i,
    imagemCapa: i === 0 ? 'jogo-1.jpg' : null,
  }));
}

describe('Loja', () => {
  let fixture: ComponentFixture<Loja>;
  let http: HttpTestingController;

  const html = () => fixture.nativeElement as HTMLElement;

  async function responderComJogos(jogos: Jogo[]) {
    http.expectOne(`${API_URL}/jogos`).flush(jogos);
    await fixture.whenStable();
    fixture.detectChanges();
  }

  beforeEach(async () => {
    localStorage.clear();
    localStorage.setItem('gamestore.usuario', JSON.stringify({ id: 'u1', nome: 'Ana', email: 'ana@teste.com' }));

    await TestBed.configureTestingModule({
      imports: [Loja],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Loja);
    fixture.detectChanges();
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('should create', () => {
    http.expectOne(`${API_URL}/jogos`).flush([]);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('exibe um card para cada um dos 12 jogos', async () => {
    await responderComJogos(criarJogos(12));

    expect(html().querySelectorAll('.card').length).toBe(12);
  });

  it('exibe a imagem da capa quando o jogo tem imagem e a sigla quando não tem', async () => {
    await responderComJogos(criarJogos(2));

    const cards = html().querySelectorAll('.card');
    const imagem = cards[0].querySelector('img.imagem') as HTMLImageElement;
    expect(imagem).not.toBeNull();
    expect(imagem.getAttribute('src')).toBe(`${API_URL}/capas/jogo-1.jpg`);
    expect(cards[0].querySelector('.sigla')).toBeNull();
    expect(cards[1].querySelector('img.imagem')).toBeNull();
    expect(cards[1].querySelector('.sigla')).not.toBeNull();
  });

  it('volta para a sigla quando a imagem da capa falha ao carregar', async () => {
    await responderComJogos(criarJogos(1));

    const imagem = html().querySelector('img.imagem') as HTMLImageElement;
    imagem.dispatchEvent(new Event('error'));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(html().querySelector('img.imagem')).toBeNull();
    expect(html().querySelector('.card .sigla')).not.toBeNull();
  });

  it('adicionar ao carrinho atualiza o contador do cabeçalho', async () => {
    await responderComJogos(criarJogos(3));

    (html().querySelector('.card .btn') as HTMLButtonElement).click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(html().querySelector('.contador')?.textContent?.trim()).toBe('1');
    expect(html().querySelector('.card .btn')?.textContent).toContain('No carrinho');
  });

  it('mostra mensagem e botão de nova tentativa quando o backend falha', async () => {
    http.expectOne(`${API_URL}/jogos`).flush('erro', { status: 500, statusText: 'Server Error' });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(html().textContent).toContain('Não foi possível carregar os jogos');
    expect(html().textContent).toContain('Tentar novamente');
  });
});
