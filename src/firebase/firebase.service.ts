import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
// eslint-disable-next-line @typescript-eslint/no-require-imports
import serviceAccount = require('../../environment/serviceAccountKey.json');
@Injectable()
export class FirebaseService implements OnModuleInit {
  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    console.log('Cred:', JSON.stringify(serviceAccount, null, 2));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });
  }

  getAuth() {
    return admin.auth();
  }

  getFirestore() {
    return admin.firestore();
  }

  getMessaging() {
    return admin.messaging();
  }
}
