import { Component, OnInit } from '@angular/core';
import { Sim } from '@ionic-native/sim/ngx';
import { Router } from '@angular/router';
import { AlertController,Platform, LoadingController } from '@ionic/angular';
import { ApiService } from '../../services/api.service';
import { finalize } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import Swal from 'sweetalert2';
const helper = new JwtHelperService();
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  public simInfo: any;
  public cards = [];
  // today = new Date().toJSON().slice(0,10).replace(/-/g, '-');
  user = {
    Name: '',
    phoneNumber: '',
    Gender: 'M',
    BirthDate: new Date().toJSON().slice(0, 10).replace(/-/g, '-')
  };
   isDesktop = false;
  users = [];
  constructor( public platform: Platform, private sim: Sim, private router: Router, private api: ApiService, private alertCtrl: AlertController, private loadingCtrl: LoadingController) { }
  ngOnInit() {
    this.getSimData();
    this.loadData(true);
  
 
  }
 


  loadData(refresh = false, refresher?) {
    this.api.getUsers(refresh).subscribe(res => {
      this.users = res;
      if (refresher) {
        refresher.target.complete();
      }
    });
  }
  async getSimData() {
    try {
      let simPermission = await this.sim.requestReadPermission();
      if (simPermission == "OK") {
        let simData = await this.sim.getSimInfo();
        this.simInfo = simData;
        this.cards = simData.cards;
        this.cards = this.cards.filter(x => x.phoneNumber != null);
        if(this.cards.length==0){
          this.isDesktop = true;
        }
     //   alert(JSON.stringify(simData));
      }
    } catch (error) {
      if(this.cards.length==0){
        this.isDesktop = true;
      }
    //  alert(JSON.stringify(error));
    }
  }
  async login() {
    if (this.user.Name && this.user.phoneNumber && this.user.Gender) {
      this.user.phoneNumber = this.user.phoneNumber.substr(this.user.phoneNumber.length - 10);
      const loading = await this.loadingCtrl.create();
      loading.present();
 
      this.api.login(this.user).pipe(
        finalize(() => loading.dismiss())
      )
        .subscribe(res => {
          if (res) {
            const decoded = helper.decodeToken(res);
            const r = 'tab/contacts';
            const users = this.users;
            const mydata = decoded;
            const phoneNumber = decoded['phoneNumber'];
            const navigationExtras = {
              state : {
                users,
                phoneNumber,
                mydata
              }
            };
            this.router.navigate([r], navigationExtras);
          }
        }, async err => {
          const alert = await this.alertCtrl.create({
            header: 'Login failed',
            message: err.error.msg,
            buttons: ['OK']
          });
          await alert.present();
        });
    } else {
      Swal.fire('Oops...', 'Please fill all mandatory fields!', 'error');
    }


  }

}
