import { Component, OnInit, ViewChild, AfterViewInit } from 'angular2/core';
import { Router } from 'angular2/router';
import { ClaimService } from './services/claim-service';
import { ModalDialogComponent } from './modal-dialog-component';
import { CreateClaimModalComponent } from './create-claim-modal-component';

@Component({
    selector: 'claims-list',
    templateUrl: 'app/views/claims-list.html',
    providers: [ClaimService],
    directives: [ModalDialogComponent, CreateClaimModalComponent]
})
export class ClaimsListComponent implements OnInit, AfterViewInit {
    @ViewChild(ModalDialogComponent) modalDialog: ModalDialogComponent;
    @ViewChild(CreateClaimModalComponent) createClaimModal: CreateClaimModalComponent;
    
    claims: any[] = [];
    mensagemErro: string = '';
    carregando: boolean = true;
    sinistroParaExcluir: number = null;
    
    // Filtro
    filtro: any = {
        insuredName: '',
        insuredCpf: '',
        branch: '',
        model: ''
    };
    
    constructor(
        private _claimService: ClaimService,
        private _router: Router
    ) {}
    
    ngOnInit() {
        // Verificar se o usuário está autenticado
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('Usuário não autenticado. Redirecionando para login...');
            this._router.navigate(['Login']);
            return;
        }
        
        this.carregarSinistros();
    }
    
    ngAfterViewInit() {
        // O modal já está disponível aqui
    }
    
    carregarSinistros() {
        this.carregando = true;
        this.mensagemErro = '';
        
        this._claimService.getAllClaims()
            .subscribe(
                claims => {
                    console.log('Sinistros carregados:', claims);
                    this.claims = claims;
                    this.carregando = false;
                },
                error => {
                    console.error('Erro ao carregar sinistros:', error);
                    this.mensagemErro = typeof error === 'string' ? error : 'Erro ao carregar sinistros';
                    this.carregando = false;
                    
                    // Se for erro de autorização, redireciona para o login
                    if (error.status === 401) {
                        localStorage.removeItem('token');
                        setTimeout(() => {
                            this._router.navigate(['Login']);
                        }, 1000);
                    }
                }
            );
    }
    
    pesquisar() {
        this.carregando = true;
        this.mensagemErro = '';
        
        console.log('Pesquisando com filtro:', this.filtro);
        
        this._claimService.getClaimsFilter(this.filtro)
            .subscribe(
                claims => {
                    console.log('Sinistros filtrados:', claims);
                    this.claims = claims;
                    this.carregando = false;
                    
                    if (claims.length === 0) {
                        this.mensagemErro = 'Nenhum sinistro encontrado com os filtros informados.';
                    }
                },
                error => {
                    console.error('Erro ao filtrar sinistros:', error);
                    this.mensagemErro = typeof error === 'string' ? error : 'Erro ao filtrar sinistros';
                    this.carregando = false;
                    this.claims = [];
                    
                    // Se for erro de autorização, redireciona para o login
                    if (error.status === 401) {
                        localStorage.removeItem('token');
                        setTimeout(() => {
                            this._router.navigate(['Login']);
                        }, 1000);
                    }
                }
            );
    }
    
    limparFiltro() {
        this.filtro = {
            insuredName: '',
            insuredCpf: '',
            branch: '',
            model: ''
        };
        
        this.carregarSinistros();
    }
    
    gerarRelatorio() {
        if (this.claims.length === 0) {
            this.mensagemErro = 'Não há sinistros para gerar o relatório.';
            return;
        }
        
        // Calcular a média aritmética dos valores dos seguros
        let somaValores = 0;
        let count = 0;
        
        this.claims.forEach(claim => {
            if (claim.claimValue !== null && claim.claimValue !== undefined) {
                somaValores += claim.claimValue;
                count++;
            }
        });
        
        const mediaAritmetica = count > 0 ? somaValores / count : 0;
        
        // Criar o objeto do relatório
        const relatorio = {
            dataGeracao: new Date().toISOString(),
            totalSinistros: this.claims.length,
            mediaValorSeguros: mediaAritmetica,
            valorFormatado: this.formatarMoeda(mediaAritmetica)
        };
        
        // Converter para JSON e fazer o download
        const jsonRelatorio = JSON.stringify(relatorio, null, 2);
        this.downloadArquivo(jsonRelatorio, 'relatorio-seguros.json', 'application/json');
        
        // Exibir mensagem de sucesso
        setTimeout(() => {
            if (this.modalDialog) {
                this.modalDialog.abrir('Relatório Gerado', 'O relatório foi gerado com sucesso! A média aritmética dos valores dos seguros é ' + this.formatarMoeda(mediaAritmetica), 'informacao');
            }
        }, 100);
    }
    
    downloadArquivo(conteudo: string, nomeArquivo: string, tipoConteudo: string) {
        const blob = new Blob([conteudo], { type: tipoConteudo });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        link.href = url;
        link.setAttribute('download', nomeArquivo);
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        
        setTimeout(() => {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        }, 100);
    }
    
    formatarData(data: string): string {
        if (!data) return '';
        const dataObj = new Date(data);
        return dataObj.toLocaleDateString('pt-BR');
    }
    
    formatarMoeda(valor: number): string {
        if (valor === null || valor === undefined) return 'R$ 0,00';
        
        // Formata o número como moeda brasileira (R$)
        return 'R$ ' + valor.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }
    
    editarSinistro(id: number) {
        setTimeout(() => {
            if (this.createClaimModal) {
                this.createClaimModal.abrir(id);
            }
        }, 100);
    }
    
    excluirSinistro(id: number) {
        this.sinistroParaExcluir = id;
        setTimeout(() => {
            if (this.modalDialog) {
                this.modalDialog.abrir('Confirmar Exclusão', 'Tem certeza que deseja excluir este sinistro?', 'confirmacao');
            }
        }, 100);
    }
    
    confirmarExclusao() {
        if (this.sinistroParaExcluir) {
            this._claimService.deleteClaim(this.sinistroParaExcluir)
                .subscribe(
                    () => {
                        setTimeout(() => {
                            if (this.modalDialog) {
                                this.modalDialog.abrir('Sucesso', 'Sinistro excluído com sucesso!', 'informacao');
                            }
                            this.carregarSinistros();
                            this.sinistroParaExcluir = null;
                        }, 100);
                    },
                    error => {
                        console.error('Erro ao excluir sinistro:', error);
                        setTimeout(() => {
                            if (this.modalDialog) {
                                this.modalDialog.abrir('Erro', typeof error === 'string' ? error : 'Não foi possível excluir o sinistro.', 'informacao');
                            }
                            this.sinistroParaExcluir = null;
                        }, 100);
                    }
                );
        }
    }
    
    abrirModalCriacaoSinistro() {
        setTimeout(() => {
            if (this.createClaimModal) {
                this.createClaimModal.abrir();
            }
        }, 100);
    }
    
    onSinistroSalvo() {
        setTimeout(() => {
            if (this.modalDialog) {
                this.modalDialog.abrir('Sucesso', 'Sinistro salvo com sucesso!', 'informacao');
            }
            this.carregarSinistros();
        }, 100);
    }
} 