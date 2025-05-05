import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
// eslint-disable-next-line @typescript-eslint/no-require-imports
import serviceAccount = require('../../environment/serviceAccountKey.json');
@Injectable()
export class FirebaseService implements OnModuleInit {
  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
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
