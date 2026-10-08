import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Loja } from './loja/loja';
import { authGuard } from './guards/auth.guard';


export const routes: Routes = [
    {path:"", redirectTo: "home", pathMatch: 'full'},
    {path: "home", component: Home},
    {path: "loja", component: Loja, canActivate: [authGuard]},
    {path: "**", redirectTo: "home"}
];
