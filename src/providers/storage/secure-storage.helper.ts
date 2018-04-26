import { Injectable } from '@angular/core';
import { SecureStorage, SecureStorageObject } from '@ionic-native/secure-storage';

import { OAuthStorageImpl } from './oauth-storage-impl';

@Injectable()
export class SecureStorageHelper {

  oAuthStorageImpl: OAuthStorageImpl;

  constructor(private secureStorage: SecureStorage) {
  }

  oAuthStorageImplInstance(): Promise<OAuthStorageImpl> {
    return new Promise((resolve) => {
      if (this.oAuthStorageImpl) {
        resolve(this.oAuthStorageImpl);
      }
      this.secureStorage.create('OAuthStorageObject').then((storageObj: SecureStorageObject) => {
        const storage = new OAuthStorageImpl(storageObj);
        storage.loadMemory().then(() => {
          this.oAuthStorageImpl = storage;
          resolve(storage);
        })
      });
    });
  }

}