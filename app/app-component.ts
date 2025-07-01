import { Component, OnInit } from 'angular2/core';
import { RouteConfig, ROUTER_DIRECTIVES, ROUTER_PROVIDERS, Router } from 'angular2/router';
import { FormLoginComponent } from './form-login-component';
import { ClaimsListComponent } from './claims-list-component';
import { Http, Headers, RequestOptions } from 'angular2/http';

@Component({
    selector: 'my-app',
    template: `
        <div class="container">
            <nav class="navbar navbar-default" *ngIf="isLoggedIn()">
                <div class="container-fluid">
                    <div class="navbar-header">
                        <a class="navbar-brand" href="#">Sistema de Sinistros</a>
                    </div>
                    <div class="navbar-right">
                        <button class="btn btn-default navbar-btn" (click)="logout()">
                            <span class="glyphicon glyphicon-log-out"></span> Sair
                        </button>
                    </div>
                </div>
            </nav>
            <router-outlet></router-outlet>
        </div>
    `,
    directives: [ROUTER_DIRECTIVES],
    providers: [ROUTER_PROVIDERS]
})
@RouteConfig([
    { path: '/', name: 'Login', component: FormLoginComponent, useAsDefault: true },
    { path: '/sinistros', name: 'ClaimsList', component: ClaimsListComponent }
])
export class AppComponent implements OnInit {
    constructor(
        private _router: Router,
        private _http: Http
    ) {}
    
    ngOnInit() {
        // Verificar a rota atual e o estado de autenticação
        const token = localStorage.getItem('token');
        const pathname = window.location.pathname;
        
        console.log('AppComponent inicializado, pathname:', pathname);
        
        // Se estiver na rota raiz e já estiver autenticado, redireciona para sinistros
        if ((pathname === '/' || pathname === '') && token) {
            console.log('Usuário já autenticado na rota raiz, redirecionando para sinistros...');
            setTimeout(() => {
                this._router.navigate(['ClaimsList']);
            }, 100);
        }
        
        // Se estiver na rota de sinistros e não estiver autenticado, redireciona para login
        if (pathname.indexOf('sinistros') !== -1 && !token) {
            console.log('Usuário não autenticado tentando acessar sinistros, redirecionando para login...');
            setTimeout(() => {
                this._router.navigate(['Login']);
            }, 100);
        }
    }
    
    isLoggedIn(): boolean {
        const token = localStorage.getItem('token');
        return token !== null && token !== undefined && token !== '';
    }
    
    logout() {
        const token = localStorage.getItem('token');
        if (token) {
            let headers = new Headers({ 
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            });
            let options = new RequestOptions({ headers: headers });
            
            this._http.post('http://localhost:5000/api/Auth/logout', JSON.stringify({}), options)
                .subscribe(
                    response => {
                        console.log('Logout realizado com sucesso:', response);
                        localStorage.removeItem('token');
                        this._router.navigate(['Login']);
                    },
                    error => {
                        console.error('Erro ao fazer logout:', error);
                        // Mesmo com erro, remove o token e redireciona para o login
                        localStorage.removeItem('token');
                        this._router.navigate(['Login']);
                    }
                );
        } else {
            this._router.navigate(['Login']);
        }
    }
}