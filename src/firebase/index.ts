'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore'

// دالة لتهيئة خدمات Firebase بشكل مستقر
export function initializeFirebase() {
  let firebaseApp: FirebaseApp;

  // التحقق مما إذا كان هناك تطبيق مهيأ بالفعل لمنع التكرار
  if (!getApps().length) {
    // استخدام الإعدادات المحلية دائماً لضمان استقرار الاتصال في بيئة التطوير
    firebaseApp = initializeApp(firebaseConfig);
  } else {
    firebaseApp = getApp();
  }

  return getSdks(firebaseApp);
}

export function getSdks(firebaseApp: FirebaseApp) {
  // استخدام التوصيل الطويل (Long Polling) لضمان عمل Firestore في كافة بيئات الشبكة
  const firestore = initializeFirestore(firebaseApp, {
    experimentalForceLongPolling: true,
  });

  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: firestore
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
