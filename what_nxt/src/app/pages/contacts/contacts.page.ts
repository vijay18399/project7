import { Component, OnInit } from '@angular/core';
import { Contacts } from '@ionic-native/contacts';
import { Platform } from '@ionic/angular';
import { ApiService } from '../../services/api.service';
import { LoadingController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { Socket } from 'ngx-socket-io';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.page.html',
  styleUrls: ['./contacts.page.scss'],
})
export class ContactsPage implements OnInit {
  regex = /^[+0-9 ]+$/ ;
  users = [];
  mynumber = '';
  allContacts = [];
  r = [
    {
      '_objectInstance': {
     
        'displayName': 'soundarya',
        'phoneNumbers': [
          {
            'id': '5',
            'pref': false,
            'value': '6302342712',
            'type': 'mobile'
          }
        ],
        
  
      },
      'rawId': '1'
    },
    {
      '_objectInstance': {
     
        'displayName': 'Ravi Cse c',
        'phoneNumbers': [
          {
            'id': '5',
            'pref': false,
            'value': '8121193336',
            'type': 'mobile'
          }
        ],
        
  
      },
      'rawId': '4'
    },
    {
      '_objectInstance': {
        'displayName': 'vijay',
        'phoneNumbers': [
          {
            'id': '10',
            'pref': false,
            'value': '6301832161',
            'type': 'mobile'
          }
        ],
      },
      'rawId': '2'
    }
  ];
  x = '';
  mydata = null;
  // tslint:disable-next-line: max-line-length
  constructor(private iab: InAppBrowser, private socket: Socket, private activatedRoute: ActivatedRoute, private router: Router, private contacts: Contacts, private apiService: ApiService, private plt: Platform, public loadingController: LoadingController) {
    this.activatedRoute.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation().extras.state) {
        this.users = this.router.getCurrentNavigation().extras.state.users;
        this.mynumber = this.router.getCurrentNavigation().extras.state.phoneNumber;
        this.mydata = this.router.getCurrentNavigation().extras.state.mydata;
        this.x = JSON.stringify(this.users);
        console.log(this.users);
      }
    });

   }

  ngOnInit() {
    this.socket.connect();
    this.plt.ready().then(() => {
     // this.mynumber = this.activatedRoute.snapshot.paramMap.get('phoneNumber');
      this.getAllContacts();
    });
    if (this.allContacts.length === 0) {
      this.allContacts = this.r;
    }
    this.socket.fromEvent(this.mynumber).subscribe(message => {
       alert(JSON.stringify(message));
  });
  }
logout() {
  this.apiService.logout();
}
  loadData(refresh = false, refresher?) {
  this.apiService.getUsers(refresh).subscribe(res => {
      this.users = res;
      this.getAllContacts();
      if (refresher) {
        refresher.target.complete();
      }
    });

  }
    getAllContacts() {
    this.contacts.find(['displayName', 'phoneNumbers'], {filter: '', multiple: true})
    .then(data => {
      // tslint:disable-next-line: max-line-length
      this.allContacts = data.filter(x => x.phoneNumbers != null &&  x.displayName != null &&  x['_objectInstance'].phoneNumbers[0].value.length >= 10 && this.regex.test(x['_objectInstance'].phoneNumbers[0].value) && this.users.includes(this.Contactparser(x['_objectInstance'].phoneNumbers[0].value) ) && this.Contactparser(x['_objectInstance'].phoneNumbers[0].value) !== this.mynumber  );
  });
}

 Contactparser(str) {
  str = str.split(' ').join('');
  str = str.slice(str.length - 10);
  return str ;
}
open(contact) {
 const phoneNumber2 = this.Contactparser(contact._objectInstance.phoneNumbers[0].value);
 const phoneNumber = this.mynumber;
 const mydata = this.mydata;
 const route = 'chat';
 const navigationExtras = {
  state: {
    contact,
    phoneNumber,
    phoneNumber2,
    mydata
  }
};
 this.router.navigate([route], navigationExtras);
}

search() {
  const phoneNumber =  this.mynumber;
  const route = 'search';
  const contacts = this.allContacts;
  const navigationExtras = {
     state : {
      contacts, phoneNumber
     }
 };
  this.router.navigate([route], navigationExtras);
}
browser(url) {
  console.log(url);
  const tarea_regex = /^(http|https)/;
  if (tarea_regex.test(url.toLowerCase()) === true) {
    const browser = this.iab.create(url, '_system');
  } else {
    const browser = this.iab.create('https://' + url, '_system');
  }
  
}

}
