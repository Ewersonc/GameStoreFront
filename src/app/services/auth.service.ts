import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { API_URL } from '../config/api';

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface CadastroRequest {
  nome: string;
  email: string;
  senha: string;
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
}

export interface LoginResponse extends Usuario {
  token: string;
}

const CHAVE_TOKEN = 'gamestore.token';
const CHAVE_USUARIO = 'gamestore.usuario';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);

  private readonly _usuario = signal<Usuario | null>(this.lerUsuarioSalvo());

  readonly usuario = this._usuario.asReadonly();

  login(dados: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${API_URL}/auth/login`, dados).pipe(
      tap((resposta) => this.iniciarSessao(resposta))
    );
  }

  cadastrar(dados: CadastroRequest): Observable<unknown> {
    return this.http.post(`${API_URL}/usuarios`, dados);
  }

  logout(): void {
    localStorage.removeItem(CHAVE_TOKEN);
    localStorage.removeItem(CHAVE_USUARIO);
    this._usuario.set(null);
  }

  get token(): string | null {
    const token = localStorage.getItem(CHAVE_TOKEN);
    if (!token) {
      return null;
    }
    if (this.expirado(token)) {
      this.logout();
      return null;
    }
    return token;
  }

  estaAutenticado(): boolean {
    return this.token !== null;
  }

  private iniciarSessao(resposta: LoginResponse): void {
    const usuario: Usuario = { id: resposta.id, nome: resposta.nome, email: resposta.email };
    localStorage.setItem(CHAVE_TOKEN, resposta.token);
    localStorage.setItem(CHAVE_USUARIO, JSON.stringify(usuario));
    this._usuario.set(usuario);
  }

  private lerUsuarioSalvo(): Usuario | null {
    try {
      const bruto = localStorage.getItem(CHAVE_USUARIO);
      return bruto ? (JSON.parse(bruto) as Usuario) : null;
    } catch {
      return null;
    }
  }

  private expirado(token: string): boolean {
    try {
      const payloadBase64 = token.split('.')[1];
      const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
      const json = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='));
      const payload: { exp?: number } = JSON.parse(json);
      return typeof payload.exp !== 'number' || payload.exp * 1000 <= Date.now();
    } catch {
      return true;
    }
  }
}
