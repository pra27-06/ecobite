/**
 * EcoBite AI - Firebase Storage Service Layer
 * 
 * Provides managed asset upload pipelines for:
 * - Scanned meal images (temporary student scans)
 * - Official campus canteen menu board photographs
 * - Validates file types, sizes, and student permissions
 */

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/config';
import type { ServiceResponse } from '../types';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const storageService = {
  /**
   * Upload student food photo for nutritional analysis
   * Path: userScans/{userId}/{timestamp}_{filename}
   */
  async uploadFoodScanImage(
    file: File,
    userId: string
  ): Promise<ServiceResponse<string>> {
    // Client-side validations
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return {
        success: false,
        error: 'Invalid file format. Only JPEG, PNG, and WebP images are permitted.',
      };
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return {
        success: false,
        error: 'Image exceeds maximum allowable size of 5 MB.',
      };
    }

    if (!storage) {
      return {
        success: false,
        error: 'Firebase Storage is unconfigured. Running in local demonstration mode.',
      };
    }

    try {
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storagePath = `userScans/${userId}/${Date.now()}_${sanitizedName}`;
      const storageRef = ref(storage, storagePath);

      const snapshot = await uploadBytes(storageRef, file, {
        contentType: file.type,
        customMetadata: {
          uploadedBy: userId,
          purpose: 'food_intelligence_scan',
        },
      });

      const downloadUrl = await getDownloadURL(snapshot.ref);
      return { success: true, data: downloadUrl };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Storage upload failed.';
      return { success: false, error: message };
    }
  },

  /**
   * Upload official canteen menu board photo (Protected to campus admins)
   * Path: campusBoards/{campusId}/{canteenId}/{timestamp}_{filename}
   */
  async uploadCanteenMenuBoard(
    file: File,
    campusId: string,
    canteenId: string
  ): Promise<ServiceResponse<string>> {
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return { success: false, error: 'Invalid file format. Only JPEG, PNG, WebP allowed.' };
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return { success: false, error: 'File size exceeds 5 MB limit.' };
    }

    if (!storage) {
      return {
        success: false,
        error: 'Firebase Storage is unconfigured.',
      };
    }

    try {
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storagePath = `campusBoards/${campusId}/${canteenId}/${Date.now()}_${sanitizedName}`;
      const storageRef = ref(storage, storagePath);

      const snapshot = await uploadBytes(storageRef, file, {
        contentType: file.type,
        customMetadata: {
          campusId,
          canteenId,
          source: 'official_menu_board',
        },
      });

      const downloadUrl = await getDownloadURL(snapshot.ref);
      return { success: true, data: downloadUrl };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to upload menu board image.';
      return { success: false, error: message };
    }
  },
};
