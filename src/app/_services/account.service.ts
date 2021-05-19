//oidc-client based account service, it manages: 
//-the form login to the auth server storing the resulting JWT in local storage, the same JWT will be sent in header in the calls to resource srver
//-mantains the current user as observable
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from "oidc-client";
import { environment } from '@environments/environment';
import { Constants } from '@app/constants';
import { ILoginService } from './login.service';



@Injectable({ providedIn: 'root' })
export class AccountService {
    private userSubject: BehaviorSubject<User>;
    public user: Observable<User>;

    authority: ILoginService;


    constructor(
        private router: Router,
        private http: HttpClient) {

        this.userSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('user')));
        this.user = this.userSubject.asObservable();


    }


    public notifyUser(user: User, authority: ILoginService ) {
        this.authority = authority;
        this.userSubject.next(user);
    }

    public get userValue(): User {
        return this.userSubject.value;
    }

    //form login
    login(username, password) {
        return this.http.post<User>(`${environment.apiUrl}/users/login`, { username, password })
            .pipe(map(user => {
                // store user details and jwt token in local storage to keep user logged in between page refreshes
                localStorage.setItem('user', JSON.stringify(user));
                this.userSubject.next(user);
                return user;
            }));
    }




    logout() {
        console.log("logout()");
        // remove user from local storage and set current user to null
        try{
            this.authority.logout();
        }
        finally{
            localStorage.removeItem('user');
            this.userSubject.next(null);
            this.router.navigate(['/account/login']);            
        }

    }




    register(user: User) {
        return this.http.post(`${environment.apiUrl}/users/register`, user);
    }

    getAll() {
        return this.http.get<User[]>(`${environment.apiUrl}/users`);
    }

    getById(id: string) {
        return this.http.get<User>(`${environment.apiUrl}/users/${id}`);
    }

    update(id, params) {
        return this.http.post(`${environment.apiUrl}/users/update/${id}`, params) //todo da rimettere in PUT anziche POST (cors problems)
            .pipe(map(x => {
                // update stored user if the logged in user updated their own record
                if (id == this.userValue.id_token) {
                    // update local storage
                    const user = { ...this.userValue, ...params };
                    localStorage.setItem('user', JSON.stringify(user));

                    // publish updated user to subscribers
                    this.userSubject.next(user);
                }
                return x;
            }));
    }

    delete(id: string) {
        return this.http.get(`${environment.apiUrl}/users/delete/${id}`) //todo da rimettere in DELETE anziche GET (cors problems)
            .pipe(map(x => {
                // auto logout if the logged in user deleted their own record
                if (id == this.userValue.id_token) {
                    this.logout();
                }
                return x;
            }));
    }
}