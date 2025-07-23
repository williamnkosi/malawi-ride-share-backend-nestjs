import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { Bucket } from '@google-cloud/storage';

// eslint-disable-next-line @typescript-eslint/no-require-imports
import serviceAccount = require('../../environment/serviceAccountKey.json');

export enum StorageBucket {
  USER_PROFILES_IMAGES = 'malawi-ride-share-profiles-images',
  DRIVER_DOCUMENTS = 'malawi-ride-share-driver-docs',
  VEHICLE_IMAGES = 'malawi-ride-share-vehicles-images',
  TRIP_RECEIPTS = 'malawi-ride-share-receipts',
}
@Injectable()
export class FirebaseService implements OnModuleInit {
  private storage: admin.storage.Storage;
  private buckets: Map<StorageBucket, Bucket> = new Map();
  constructor(private readonly config: ConfigService) {}

  async onModuleInit() {
    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert(
          serviceAccount as admin.ServiceAccount,
        ),
      });
    }

    this.storage = admin.storage();
    await this.initializeBuckets();
  }

  private async initializeBuckets() {
    for (const bucketName of Object.values(StorageBucket)) {
      try {
        const bucket = this.storage.bucket(bucketName);

        // Check if bucket exists, create if it doesn't
        const [exists] = await bucket.exists();
        if (!exists) {
          await bucket.create({
            location: 'US-CENTRAL1',
            storageClass: 'STANDARD',
          });
          console.log(`Created bucket: ${bucketName}`);
        }

        this.buckets.set(bucketName, bucket);
        console.log(`Initialized bucket: ${bucketName}`);
      } catch (error) {
        console.error(`Error initializing bucket ${bucketName}:`, error);
      }
    }
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

  async uploadUserProfileImage(
    firebaseId: string,
    file?: Express.Multer.File,
  ): Promise<string> {
    try {
      if (!file) throw new Error('No File present');
      // Removed unsafe and unused assignment to 'test'
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const fileExtension =
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        file.originalname.split('.').pop();

      const fileName = `profile_${Date.now()}.${fileExtension}`;
      const filePath = `users/${firebaseId}/${fileName}`;

      const bucket = this.buckets.get(StorageBucket.USER_PROFILES_IMAGES);
      if (!bucket) {
        throw new Error('Profile images bucket not initialized');
      }

      const fileRef = bucket.file(filePath);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      await fileRef.save(file.buffer, {
        metadata: {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          contentType: file.mimetype,
          metadata: {
            firebaseId,
            uploadedAt: new Date().toISOString(),
          },
        },
        public: true, // Make the file publicly accessible
      });

      // Make the file publicly accessible (if not set above)
      await fileRef.makePublic();

      return `https://storage.googleapis.com/${bucket.name}/${filePath}`;
    } catch (error) {
      console.error('Error uploading profile image:', error);
      throw new Error(`Failed to upload profile image: ${error}`);
    }
  }
}
