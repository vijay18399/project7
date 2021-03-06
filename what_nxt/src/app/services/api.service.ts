import { Storage } from '@ionic/storage';
import { OfflineManagerService } from './offline-manager.service';
import { NetworkService, ConnectionStatus } from './network.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, tap, take, catchError, switchMap } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
const helper = new JwtHelperService();
import { BehaviorSubject, Observable, from } from 'rxjs';
import { Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

const API_STORAGE_KEY = 'specialkey';
export const TOKEN_KEY = 'jwt-token';
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  public user: Observable<any>;
  private userData = new BehaviorSubject(null);
  constructor(private router: Router, private storage: Storage, private plt: Platform, private http: HttpClient, private networkService: NetworkService, private offlineManager: OfflineManagerService) {
    this.loadStoredToken();
  }

  loadStoredToken() {
    const platformObs = from(this.plt.ready());

    this.user = platformObs.pipe(
      switchMap(() => {
        return from(this.storage.get(TOKEN_KEY));
      }),
      map(token => {
        if (token) {
          const decoded = helper.decodeToken(token);
          this.userData.next(decoded);
          return true;
        } else {
          return null;
        }
      })
    );
  }

  getUsers(forceRefresh: boolean = false): Observable<any> {
    if (this.networkService.getCurrentNetworkStatus() == ConnectionStatus.Offline || !forceRefresh) {
      return from(this.getLocalData('users'));
    } else {
      return this.http.get(`${environment.apiUrl6}/numbers`).pipe(
        map(res => res),
        tap(res => {
          console.log('returns real live API data');
          this.setLocalData('users', res);
        })
      );
    }
  }
  getGroups(forceRefresh: boolean = false): Observable<any> {
    if (this.networkService.getCurrentNetworkStatus() == ConnectionStatus.Offline || !forceRefresh) {
      return from(this.getLocalData('groups'));
    } else {
      return this.http.get(`${environment.apiUrl6}/groups`).pipe(
        map(res => res),
        tap(res => {
          console.log('returns real live API data');
          this.setLocalData('groups', res);
        })
      );
    }
  }
  addToGroups(data, gid): Observable<any> {
    return this.http.post(`${environment.apiUrl6}/addto/` + gid, data).pipe(
      take(1),
    );
  }
  CreateGroups(data): Observable<any> {
    return this.http.post(`${environment.apiUrl6}/creategroup`, data).pipe(
      take(1),
    );
  }
  UpdateGroup(data): Observable<any> {
    return this.http.post(`${environment.apiUrl6}/update`, data).pipe(
      take(1),
    );
  }

  getMessages(forceRefresh: boolean = false, data): Observable<any> {
    if (this.networkService.getCurrentNetworkStatus() == ConnectionStatus.Offline || !forceRefresh) {
      return from(this.getLocalData(data.to));
    } else {
      // tslint:disable-next-line: no-shadowed-variable
      const from = data.from;
      const to = data.to;
      const url = `${environment.apiUrl6}/messages/` + from + "/" + to;
      return this.http.get(url).pipe(
        map(res => res),
        tap(res => {
          console.log('returns real live API data');
          this.setLocalData(data.to, res);
        })
      );
    }
  }
  getGMessages(forceRefresh: boolean = false, data): Observable<any> {
    if (this.networkService.getCurrentNetworkStatus() === ConnectionStatus.Offline || !forceRefresh) {
      return from(this.getLocalData(data.groupid));
    } else {
      // tslint:disable-next-line: no-shadowed-variable
      const gid = data.groupid;
      const url = `${environment.apiUrl6}/gmessages/` + gid;
      return this.http.get(url).pipe(
        map(res => res),
        tap(res => {
          console.log('returns real live API data');
          this.setLocalData(gid, res);
        })
      );
    }
  }

  UpdateLocalMessages(forceRefresh: boolean = false, data): Observable<any> {
    const from = data.from;
    const to = data.to;
    const url = `${environment.apiUrl6}/messages/` + from + "/" + to;
    return this.http.get(url).pipe(
      map(res => res),
      tap(res => {
        console.log('Message added to storage');
        this.setLocalData(data.to, res);
      })
    );
  }

  updateUser(user, data): Observable<any> {
    let url = `${environment.apiUrl6}/numbers`;

    if (this.networkService.getCurrentNetworkStatus() == ConnectionStatus.Offline) {
      return from(this.offlineManager.storeRequest(url, 'PUT', data));
    } else {
      return this.http.put(url, data).pipe(
        catchError(err => {
          this.offlineManager.storeRequest(url, 'PUT', data);
          throw new Error(err);
        })
      );
    }
  }

  // Save result of API requests
  private setLocalData(key, data) {
    this.storage.set(`${API_STORAGE_KEY}-${key}`, data);
  }

  // Get cached API result
  private getLocalData(key) {
    console.log('return local data!');
    return this.storage.get(`${API_STORAGE_KEY}-${key}`);
  }
 async  getMyData() {
    const token = await this.storage.get(TOKEN_KEY);
     return(helper.decodeToken(token));
  }
  getUserToken() {
    return this.userData.getValue();
  }

  getUserData() {
    const phoneNumber = this.getUserToken().phoneNumber;
    return phoneNumber;
  }
  getUser() {
    return this.userData.getValue();
  }
  login(credentials: { Name: string, phoneNumber: string, Gender: string, BirthDate: string }) {
    return this.http.post(`${environment.apiUrl6}/login`, credentials).pipe(
      take(1),
      map(res => {
        // Extract the JWT
        return res['token'];
      }),
      switchMap(token => {
        const decoded = helper.decodeToken(token);
        this.userData.next(decoded);
        const storageObs = from(this.storage.set(TOKEN_KEY, token));
        return storageObs;
      })
    );
  }
  
  logout() {
    this.storage.remove(TOKEN_KEY).then(() => {
      this.router.navigateByUrl('/');
      this.userData.next(null);
    });
  }

  Detecturls(data) {
    return this.http.post(`${environment.apiUrl5}/predict`, data).pipe(
      take(1)
    );
  }
  Translate(languages, text) {
    const url = `${environment.apiUrl4}/translate`;
    const endpoint = 'https://api.cognitive.microsofttranslator.com';
    const  region = 'centralindia';
    const key = '9c91a7130db04381860b12547fd31d35';
    const data = {
      text, languages,endpoint,region,key
    };
    return this.http.post(url, data).pipe(
      take(1)
    );
  }

  Upload(data) {
    return this.http.post(`${environment.apiUrl3}`, data).pipe(
      take(1)
    );
  }
  PostContacts(data) {
    return this.http.post(`${environment.apiUrl6}/contacts`, data).pipe(
      take(1)
    );
  }

}
