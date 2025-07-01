import { Injectable } from 'angular2/core';
import { Http, Response, Headers, RequestOptions } from 'angular2/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';

@Injectable()
export class LoginService {
    private loginUrl: string = 'http://localhost:5000/api/Auth/login';

    constructor(private http: Http){}

    login(username: string, password: string): Observable<any> {
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        let body = JSON.stringify({ username, password });
        
        return this.http.post(this.loginUrl, body, options)
            .map(this.extractData)
            .catch(this.handleError);
    }
    
    private extractData(res: Response) {
        let body = res.json();
        return body || {};
    }
    
    private handleError(error: any) {
        let errMsg: string;
        
        try {
            const errorBody = error.json();
            errMsg = errorBody.message || 'Credenciais inválidas';
        } catch (e) {
            errMsg = error.message ? error.message : 'Credenciais inválidas';
        }
        
        console.error('Erro na requisição:', errMsg);
        return Observable.throw(errMsg);
    }
}