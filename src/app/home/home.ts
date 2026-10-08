import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home {
  private authService = inject(AuthService);
  private router = inject(Router);

  modo = signal<'login' | 'cadastro'>('login');

  email = '';
  senha = '';
  nome = '';

  erro = signal<string | null>(null);
  sucesso = signal<string | null>(null);
  carregando = signal(false);

  trocarModo(novoModo: 'login' | 'cadastro') {
    this.modo.set(novoModo);
    this.erro.set(null);
    this.sucesso.set(null);
  }

  onSubmit() {
    this.erro.set(null);
    this.sucesso.set(null);
    this.carregando.set(true);

    if (this.modo() === 'login') {
      this.authService.login({ email: this.email, senha: this.senha }).subscribe({
        next: () => {
          this.carregando.set(false);
          this.senha = '';
          this.router.navigate(['/loja']);
        },
        error: (err: HttpErrorResponse) => {
          this.carregando.set(false);
          this.erro.set(
            err.status === 0
              ? 'Servidor indisponível. Tente novamente em instantes.'
              : 'Email ou senha inválidos'
          );
          console.error(err);
        }
      });
    } else {
      this.authService.cadastrar({ nome: this.nome, email: this.email, senha: this.senha }).subscribe({
        next: () => {
          this.carregando.set(false);
          this.senha = '';
          this.modo.set('login');
          this.sucesso.set('Cadastro realizado! Faça login para entrar.');
        },
        error: (err: HttpErrorResponse) => {
          this.carregando.set(false);
          if (err.status === 409) {
            this.erro.set('Este e-mail já está cadastrado.');
          } else if (err.status === 400) {
            this.erro.set('Dados inválidos. Use um e-mail válido e uma senha de 6 a 72 caracteres.');
          } else if (err.status === 0) {
            this.erro.set('Servidor indisponível. Tente novamente em instantes.');
          } else {
            this.erro.set('Erro ao cadastrar. Verifique os dados.');
          }
          console.error(err);
        }
      });
    }
  }
}
