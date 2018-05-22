import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { IonicPage, Platform, ToastController, ViewController } from 'ionic-angular';
// import { TabsPage } from '../tabs/tabs';
import { LoginService } from '../../providers';

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {

  private loginErrorString: string;

  constructor(private loginService: LoginService,
    private toastCtrl: ToastController,
    private translateService: TranslateService,
    private platform: Platform,
    private viewCtrl: ViewController) {

    this.translateService.get('LOGIN_ERROR').subscribe((value) => {
      this.loginErrorString = value;
    });

    if (this.platform.is('core')) {
      this.loginService.redirectLogin();
    } else {
      this.loginService.appLogin((data) => {
        // this.navCtrl.push(TabsPage);
      }, (err) => {
        // Unable to log in
        let toast = this.toastCtrl.create({
          message: this.loginErrorString,
          duration: 3000,
          position: 'top'
        });
        toast.present();
      });
      let that = this;
      setTimeout(() => {
        that.viewCtrl.dismiss();
      }, 2000);
    }
  }
}
