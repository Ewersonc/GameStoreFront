import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';

import { Header } from './header';
import { AuthService } from '../services/auth.service';

describe('Header', () => {
  let fixture: ComponentFixture<Header>;

  beforeEach(async () => {
    localStorage.clear();
    localStorage.setItem('gamestore.token', 'token-de-teste');
    localStorage.setItem('gamestore.usuario', JSON.stringify({ id: 'abc123', nome: 'Ana', email: 'ana@teste.com' }));

    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Header);
    await fixture.whenStable();
  });

  afterEach(() => localStorage.clear());

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('mostra o nome do usuário logado', () => {
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Ana');
  });

  it('o botão Sair encerra a sessão e volta para a home', async () => {
    const router = TestBed.inject(Router);
    const navegar = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    const botaoSair = (fixture.nativeElement as HTMLElement).querySelector('.sair') as HTMLButtonElement;
    botaoSair.click();

    expect(localStorage.getItem('gamestore.token')).toBeNull();
    expect(TestBed.inject(AuthService).usuario()).toBeNull();
    expect(navegar).toHaveBeenCalledWith(['/home']);
  });
});
