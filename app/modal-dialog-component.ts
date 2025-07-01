import { Component, EventEmitter, Output } from 'angular2/core';

@Component({
    selector: 'modal-dialog',
    templateUrl: 'app/views/modal-dialog.html'
})
export class ModalDialogComponent {
    @Output() onConfirm = new EventEmitter<boolean>();
    @Output() onClose = new EventEmitter<boolean>();
    
    visivel: boolean = false;
    titulo: string = '';
    mensagem: string = '';
    tipoModal: string = 'informacao'; // 'informacao' ou 'confirmacao'
    
    abrir(titulo: string, mensagem: string, tipo: string = 'informacao') {
        this.titulo = titulo;
        this.mensagem = mensagem;
        this.tipoModal = tipo;
        this.visivel = true;
        
        // Adiciona a classe modal-open ao body
        if (document && document.body) {
            document.body.classList.add('modal-open');
        }
    }
    
    fechar() {
        this.visivel = false;
        
        // Remove a classe modal-open do body
        if (document && document.body) {
            document.body.classList.remove('modal-open');
        }
        
        this.onClose.emit(true);
    }
    
    confirmar() {
        this.visivel = false;
        
        // Remove a classe modal-open do body
        if (document && document.body) {
            document.body.classList.remove('modal-open');
        }
        
        this.onConfirm.emit(true);
    }
} 