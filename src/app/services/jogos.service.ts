import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../config/api';

export interface Jogo {
  id: string;
  nome: string;
  genero: string;
  sinopse: string;
  desenvolvedor: string;
  anoLancamento: number;
  valor: number;
  imagemCapa?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class JogosService {
  private http = inject(HttpClient);

  listar(): Observable<Jogo[]> {
    return this.http.get<Jogo[]>(`${API_URL}/jogos`);
  }

  urlCapa(jogo: Jogo): string | null {
    return jogo.imagemCapa ? `${API_URL}/capas/${encodeURIComponent(jogo.imagemCapa)}` : null;
  }
}
