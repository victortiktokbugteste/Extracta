import { Component, EventEmitter, Output } from 'angular2/core';
import { ControlGroup, FormBuilder, Validators, Control } from 'angular2/common';
import { ClaimService } from './services/claim-service';

@Component({
    selector: 'create-claim-modal',
    templateUrl: 'app/views/create-claim-modal.html',
    providers: [ClaimService]
})
export class CreateClaimModalComponent {
    @Output() onClose = new EventEmitter<boolean>();
    @Output() onSave = new EventEmitter<boolean>();
    
    visivel: boolean = false;
    sinistroForm: ControlGroup;
    errosValidacao: any[] = [];
    salvando: boolean = false;
    modoEdicao: boolean = false;
    titulo: string = 'Criação de novo sinistro';
    
    sinistroId: number = null;
    segurado: any = {
        name: '',
        cpf: '',
        dateOfBirth: ''
    };
    
    veiculo: any = {
        value: null,
        branch: '',
        model: ''
    };
    
    constructor(
        private _formBuilder: FormBuilder,
        private _claimService: ClaimService
    ) {
        this.criarFormulario();
    }
    
    criarFormulario() {
        this.sinistroForm = this._formBuilder.group({
            'nome': ['', Validators.required],
            'cpf': ['', Validators.required],
            'dataNascimento': ['', Validators.required],
            'marca': ['', Validators.required],
            'modelo': ['', Validators.required],
            'valor': ['', Validators.required]
        });
    }
    
    abrir(id?: number) {
        this.visivel = true;
        this.limparFormulario();
        
        if (id) {
            this.modoEdicao = true;
            this.titulo = 'Editar sinistro';
            this.sinistroId = id;
            this.carregarSinistro(id);
        } else {
            this.modoEdicao = false;
            this.titulo = 'Criação de novo sinistro';
            this.sinistroId = null;
        }
        
        if (document && document.body) {
            document.body.classList.add('modal-open');
        }
    }
    
    // Função auxiliar para adicionar zeros à esquerda
    adicionarZerosEsquerda(num: number, tamanho: number): string {
        let s = num + "";
        while (s.length < tamanho) s = "0" + s;
        return s;
    }
    
    carregarSinistro(id: number) {
        this.salvando = true;
        this._claimService.getClaimById(id)
            .subscribe(
                sinistro => {
                    this.salvando = false;
                    if (sinistro) {
                        this.sinistroId = sinistro.id;
                        this.segurado = sinistro.insured || { name: '', cpf: '', dateOfBirth: '' };
                        this.veiculo = sinistro.vehicle || { value: null, branch: '', model: '' };
                        
                        // Formatar a data para o formato do input date (yyyy-MM-dd)
                        if (this.segurado.dateOfBirth) {
                            const data = new Date(this.segurado.dateOfBirth);
                            const ano = data.getFullYear();
                            const mes = this.adicionarZerosEsquerda(data.getMonth() + 1, 2);
                            const dia = this.adicionarZerosEsquerda(data.getDate(), 2);
                            this.segurado.dateOfBirth = ano + '-' + mes + '-' + dia;
                        }
                    } else {
                        this.errosValidacao = [{ field: 'Erro', message: 'Sinistro não encontrado.' }];
                    }
                },
                error => {
                    this.salvando = false;
                    if (error && error.errors) {
                        this.errosValidacao = error.errors;
                    } else if (typeof error === 'string') {
                        this.errosValidacao = [{ field: 'Erro', message: error }];
                    } else {
                        this.errosValidacao = [{ field: 'Erro', message: 'Erro ao carregar o sinistro.' }];
                    }
                }
            );
    }
    
    fechar() {
        this.visivel = false;
        this.errosValidacao = [];
        
        if (document && document.body) {
            document.body.classList.remove('modal-open');
        }
        
        this.onClose.emit(true);
    }
    
    limparFormulario() {
        this.segurado = {
            name: '',
            cpf: '',
            dateOfBirth: ''
        };
        
        this.veiculo = {
            value: null,
            branch: '',
            model: ''
        };
        
        this.errosValidacao = [];
        this.salvando = false;
        
        // Reset do formulário
        Object.keys(this.sinistroForm.controls).forEach(key => {
            (<Control>this.sinistroForm.controls[key]).updateValueAndValidity();
        });
    }
    
    formatarDataParaAPI(data: string): string {
        if (!data) return null;
        
        // Converte a data do formato yyyy-MM-dd para yyyy-MM-ddTHH:mm:ss.SSSZ
        const dataObj = new Date(data);
        return dataObj.toISOString();
    }
    
    salvar() {
        if (this.sinistroForm.valid) {
            this.salvando = true;
            this.errosValidacao = [];
            
            // Formata a data de nascimento para o formato esperado pela API
            const insuredData = {
                name: this.segurado.name,
                cpf: this.segurado.cpf,
                dateOfBirth: this.formatarDataParaAPI(this.segurado.dateOfBirth)
            };
            
            let dadosParaEnviar: any;
            
            if (this.modoEdicao) {
                dadosParaEnviar = {
                    id: this.sinistroId,
                    insured: insuredData,
                    vehicle: this.veiculo
                };
                
                console.log('Enviando dados para atualizar:', dadosParaEnviar);
                
                this._claimService.updateClaim(dadosParaEnviar)
                    .subscribe(
                        response => {
                            console.log('Resposta da API ao atualizar sinistro:', response);
                            this.salvando = false;
                            
                            this.fechar();
                            this.onSave.emit(true);
                        },
                        error => {
                            console.error('Erro ao atualizar sinistro:', error);
                            this.salvando = false;
                            
                            if (error && error.errors) {
                                this.errosValidacao = error.errors;
                            } else if (typeof error === 'string') {
                                this.errosValidacao = [{ field: 'Erro', message: error }];
                            } else {
                                this.errosValidacao = [{ field: 'Erro', message: 'Ocorreu um erro ao atualizar o sinistro.' }];
                            }
                        }
                    );
            } else {
                dadosParaEnviar = {
                    insured: insuredData,
                    vehicle: this.veiculo
                };
                
                console.log('Enviando dados para criar:', dadosParaEnviar);
                
                this._claimService.createClaim(dadosParaEnviar)
                    .subscribe(
                        response => {
                            console.log('Resposta da API ao criar sinistro:', response);
                            this.salvando = false;
                            
                            if (response === true) {
                                this.fechar();
                                this.onSave.emit(true);
                            } else {
                                this.errosValidacao = [{ field: 'Erro', message: 'Resposta inesperada do servidor.' }];
                            }
                        },
                        error => {
                            console.error('Erro ao criar sinistro:', error);
                            this.salvando = false;
                            
                            if (error && error.errors) {
                                this.errosValidacao = error.errors;
                            } else if (typeof error === 'string') {
                                this.errosValidacao = [{ field: 'Erro', message: error }];
                            } else {
                                this.errosValidacao = [{ field: 'Erro', message: 'Ocorreu um erro ao salvar o sinistro.' }];
                            }
                        }
                    );
            }
        }
    }
} 