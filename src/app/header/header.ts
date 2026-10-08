import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CarrinhoService } from '../services/carrinho.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  protected auth = inject(AuthService);
  protected carrinho = inject(CarrinhoService);
  private router = inject(Router);

  sair(): void {
    this.carrinho.fechar();
    this.auth.logout();
    void this.router.navigate(['/home']);
  }
}
