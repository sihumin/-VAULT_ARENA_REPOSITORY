import { initializeApp } from 'firebase/app';
import {
  getAuth,
  connectAuthEmulator,
} from 'firebase/auth';
import {
  getFirestore,
  connectFirestoreEmulator,
  initializeFirestore,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const useEmulators =
  import.meta.env.VITE_USE_EMULATORS === 'true';

const effectiveConfig = useEmulators
  ? {
      ...firebaseConfig,
      projectId: 'demo-vault-arena',
      authDomain: 'demo-vault-arena.firebaseapp.com',
    }
  : firebaseConfig;

export const app = initializeApp(effectiveConfig);
export const auth = getAuth(app);

export const db = useEmulators
  ? getFirestore(app)
  : initializeFirestore(
      app,
      {},
      firebaseConfig.firestoreDatabaseId,
    );

if (useEmulators) {
  connectAuthEmulator(
    auth,
    'http://127.0.0.1:9099',
    { disableWarnings: true },
  );

  connectFirestoreEmulator(
    db,
    '127.0.0.1',
    8080,
  );

  console.log(
    'VaultArena connected to local Firebase emulators',
  );
}
