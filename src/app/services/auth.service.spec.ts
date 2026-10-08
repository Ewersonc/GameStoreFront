import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { AuthService } from './auth.service';
import { API_URL } from '../config/api';

function criarToken(expiraEmSegundos: number): string {
  const base64url = (obj: object) =>
    btoa(JSON.stringify(obj)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const exp = Math.floor(Date.now() / 1000) + expiraEmSegundos;
  return `${base64url({ alg: 'HS256' })}.${base64url({ exp })}.assinatura`;
}

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('guarda o token e o usuário ao fazer login', () => {
    const token = criarToken(3600);

    service.login({ email: 'ana@teste.com', senha: '123456' }).subscribe();
    const req = http.expectOne(`${API_URL}/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush({ id: 'abc123', nome: 'Ana', email: 'ana@teste.com', token });

    expect(service.token).toBe(token);
    expect(service.usuario()?.nome).toBe('Ana');
    expect(service.estaAutenticado()).toBe(true);
  });

  it('logout apaga token e usuário', () => {
    localStorage.setItem('gamestore.token', criarToken(3600));
    expect(service.estaAutenticado()).toBe(true);

    service.logout();

    expect(service.estaAutenticado()).toBe(false);
    expect(service.usuario()).toBeNull();
    expect(localStorage.getItem('gamestore.token')).toBeNull();
  });

  it('token expirado não conta como autenticado e limpa a sessão', () => {
    localStorage.setItem('gamestore.token', criarToken(-60));

    expect(service.estaAutenticado()).toBe(false);
    expect(localStorage.getItem('gamestore.token')).toBeNull();
  });

  it('token malformado não conta como autenticado', () => {
    localStorage.setItem('gamestore.token', 'isto-nao-e-um-jwt');

    expect(service.estaAutenticado()).toBe(false);
  });
});
