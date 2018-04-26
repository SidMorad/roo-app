import { OAuthStorage } from 'angular-oauth2-oidc';
import { SecureStorageObject } from '@ionic-native/secure-storage';

export class OAuthStorageImpl implements OAuthStorage {

  memory = {};

  constructor(private ss: SecureStorageObject) {

  }

  getItem(key: any): string {
    return this.memory[key];
  }

  setItem(key, value) {
    try {
      const x = JSON.stringify(value);
      if (this.isString(x)) {
        this.ss.set(key, x);
      }
    } catch(err) { }
    this.memory[key] = value;
  }

  removeItem(key) {
    this.ss.remove(key);
    delete this.memory[key];
  }

  loadMemory(): Promise<void> {
    return this.ss.keys().then((keys: string[]) => {
      keys.forEach(key => {
        this.ss.get(key).then((value) => {
          if (!this.memory[key]) {
            this.memory[key] = JSON.parse(value);
          }
        })
      });
    });
  }

  private isString(x) {
    console.log('X: ', x, ' isString: ', Object.prototype.toString.call(x) === '[object String]', ' wasActually: ', Object.prototype.toString.call(x));
    return Object.prototype.toString.call(x) === '[object String]';
  }

}