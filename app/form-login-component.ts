import { Component, OnInit } from 'angular2/core';
import { Router } from 'angular2/router';

import { 
    ControlGroup, FormBuilder, Validators, AbstractControl 
} from 'angular2/common';
import { EmailValidator } from './validators/email-validator';
import { LoginService } from './services/login-service';

@Component({
    selector: 'form-login',
    templateUrl: 'app/views/formulario.html',
    providers: [LoginService]
})
export class FormLoginComponent implements OnInit {
    loginForm: ControlGroup;
    usuario: string = '';
    senha: string = '';
    mensagemErro: string = '';
    sucesso: boolean = false;
    exibirErro: boolean = false;
    
    constructor(
        private _formBuilder: FormBuilder,
        private _loginService: LoginService,
        private _router: Router
    ) {

        this.loginForm = this._formBuilder.group({
            'usuario': ['', Validators.compose([Validators.required, EmailValidator.validate])],
            'senha': ['', Validators.required]
        });
    }
    
    ngOnInit() {

        // Se já estiver autenticado, redireciona para a lista de sinistros
        const token = localStorage.getItem('token');
        if (token) {
            console.log('Usuário já autenticado, redirecionando para sinistros...');
            this._router.navigate(['ClaimsList']);
        }
    }
    
    enviar() {
        console.log('Tentando fazer login com:', this.usuario);
        if (this.loginForm.valid) {
            this._loginService.login(this.usuario, this.senha)
                .subscribe(
                    response => {
                        console.log('Resposta do login:', response);
                        if (response && response.token) {
                            localStorage.setItem('token', response.token);
                            this.sucesso = true;
                            this.exibirErro = false;
                            
                            console.log('Login bem-sucedido, redirecionando...');
                            // Redirecionar para a lista de sinistros após um breve delay
                            setTimeout(() => {
                                console.log('Navegando para ClaimsList');
                                this._router.navigate(['ClaimsList']);
                            }, 1000);
                        }
                    },
                    error => {
                        console.error('Erro no login:', error);
                        this.mensagemErro = typeof error === 'string' ? error : 'Credenciais inválidas';
                        this.exibirErro = true;
                        this.exibirModalErro();
                    }
                );
        }
    }
    
    exibirModalErro() {
        alert(this.mensagemErro);
        // Aqui poderia ser implementado um modal mais elaborado
    }
    
    hasErros(): boolean {
        return !this.loginForm.valid && !this.loginForm.pristine;
    }
}