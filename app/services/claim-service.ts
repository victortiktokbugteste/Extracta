import { Injectable } from 'angular2/core';
import { Http, Response, Headers, RequestOptions } from 'angular2/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import 'rxjs/add/observable/of';

@Injectable()
export class ClaimService {
    private apiUrl: string = 'http://localhost:5000/api/Claim/';

    constructor(private http: Http){}

    getAllClaims(): Observable<any[]> {
        const token = localStorage.getItem('token');
        let headers = new Headers({ 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        });
        let options = new RequestOptions({ headers: headers });
        
        console.log('Chamando API para obter sinistros:', this.apiUrl + 'get-all-claims');
        return this.http.get(this.apiUrl + 'get-all-claims', options)
            .map(this.extractData)
            .catch(this.handleError);
    }
    
    getClaimsFilter(filtro: any): Observable<any[]> {
        const token = localStorage.getItem('token');
        let headers = new Headers({ 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        });
        let options = new RequestOptions({ headers: headers });
        
        console.log('Chamando API para filtrar sinistros:', this.apiUrl + 'get-claims-filter');
        console.log('Filtro enviado:', JSON.stringify(filtro));
        
        return this.http.post(this.apiUrl + 'get-claims-filter', JSON.stringify(filtro), options)
            .map(this.extractData)
            .catch(this.handleError);
    }
    
    getClaimById(id: number): Observable<any> {
        const token = localStorage.getItem('token');
        let headers = new Headers({ 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        });
        let options = new RequestOptions({ headers: headers });
        
        console.log('Chamando API para obter sinistro por ID:', this.apiUrl + 'get-claim/' + id);
        return this.http.get(this.apiUrl + 'get-claim/' + id, options)
            .map(this.extractData)
            .catch(this.handleError);
    }
    
    deleteClaim(id: number): Observable<any> {
        const token = localStorage.getItem('token');
        let headers = new Headers({ 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        });
        let options = new RequestOptions({ headers: headers });
        
        console.log('Chamando API para excluir sinistro:', this.apiUrl + 'delete-claim/' + id);
        return this.http.delete(this.apiUrl + 'delete-claim/' + id, options)
            .map(response => response)
            .catch(this.handleError);
    }
    
    createClaim(claim: any): Observable<any> {
        const token = localStorage.getItem('token');
        let headers = new Headers({ 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        });
        let options = new RequestOptions({ headers: headers });
        
        console.log('Chamando API para criar sinistro:', this.apiUrl + 'salvar-sinistro');
        console.log('Dados enviados:', JSON.stringify(claim));
        
        return this.http.post(this.apiUrl + 'salvar-sinistro', JSON.stringify(claim), options)
            .map(response => response.json())
            .catch(this.handleError);
    }
    
    updateClaim(claim: any): Observable<any> {
        const token = localStorage.getItem('token');
        let headers = new Headers({ 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        });
        let options = new RequestOptions({ headers: headers });
        
        console.log('Chamando API para atualizar sinistro:', this.apiUrl + 'update-claim');
        console.log('Dados enviados:', JSON.stringify(claim));
        
        return this.http.put(this.apiUrl + 'update-claim', JSON.stringify(claim), options)
            .map(response => {
                // Verifica se a resposta está vazia (status 200 sem conteúdo)
                if (response.status === 200 && (!response.text() || response.text().trim() === '')) {
                    console.log('Resposta vazia com status 200, considerando sucesso');
                    return true;
                }
                
                try {
                    return response.json();
                } catch (e) {
                    console.log('Erro ao converter resposta para JSON, retornando true:', e);
                    return true;
                }
            })
            .catch(this.handleError);
    }
    
    private extractData(res: Response) {
        try {
            let body = res.json();
            console.log('Resposta da API:', body);
            return body || [];
        } catch (e) {
            console.error('Erro ao extrair dados da resposta:', e);
            return [];
        }
    }
    
    private handleError(error: any) {
        console.error('Erro na requisição HTTP:', error);
        
        if (error.status === 0) {
            return Observable.throw('Erro de conexão com o servidor. Verifique se a API está acessível.');
        }
        
        if (error.status === 401) {
            return Observable.throw('Não autorizado. Faça login novamente.');
        }
        
        if (error.status === 404) {
            return Observable.throw('Nenhum sinistro encontrado com os filtros informados.');
        }
        
        try {
            const errorBody = error.json();
            console.log('Corpo do erro:', errorBody);
            
            if (errorBody.errors && errorBody.errors.length > 0) {
                return Observable.throw(errorBody);
            }
            
            if (errorBody.message) {
                return Observable.throw(errorBody.message);
            }
            
            return Observable.throw('Erro ao processar a requisição');
        } catch (e) {
            console.error('Erro ao processar resposta de erro:', e);
            return Observable.throw('Erro ao processar a requisição');
        }
    }
}