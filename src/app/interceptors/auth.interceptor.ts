import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { API_URL } from '../config/api';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const paraNossaApi = req.url.startsWith(API_URL);
  const ehLogin = req.url.startsWith(`${API_URL}/auth/`);
  const token = paraNossaApi && !ehLogin ? auth.token : null;

  const requisicao = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(requisicao).pipe(
    catchError((erro: HttpErrorResponse) => {
      if (erro.status === 401 && token) {
        auth.logout();
        void router.navigate(['/home']);
      }
      return throwError(() => erro);
    })
  );
};
