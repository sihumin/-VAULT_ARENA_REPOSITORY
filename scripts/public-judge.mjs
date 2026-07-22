import { mkdir, writeFile } from 'node:fs/promises';

import {
  initializeApp,
  deleteApp,
} from 'firebase/app';

import {
  getAuth,
  connectAuthEmulator,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';

import {
  getFirestore,
  connectFirestoreEmulator,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';

const app = initializeApp({
  apiKey: 'demo-api-key',
  authDomain: 'demo-vault-arena.firebaseapp.com',
  projectId: 'demo-vault-arena',
  appId: '1:demo:web:vault-arena',
});

const auth = getAuth(app);
const db = getFirestore(app);

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

const ownerVault = doc(
  db,
  'vaults',
  'owner-test-001',
  'items',
  'main',
);

const results = [];

function addResult(name, passed, detail) {
  results.push({
    name,
    passed,
    detail,
  });
}

function isPermissionDenied(error) {
  const text = String(
    error?.code ??
    error?.message ??
    error,
  );

  return text.includes('permission-denied');
}

async function expectDenied(name, operation) {
  try {
    await operation();

    addResult(
      name,
      false,
      '예상과 달리 요청이 허용됐습니다.',
    );
  } catch (error) {
    const denied = isPermissionDenied(error);

    addResult(
      name,
      denied,
      denied
        ? '정상적으로 차단됐습니다.'
        : String(error),
    );
  }
}

async function expectAllowed(name, operation) {
  try {
    await operation();

    addResult(
      name,
      true,
      '정상적으로 허용됐습니다.',
    );
  } catch (error) {
    addResult(
      name,
      false,
      String(error),
    );
  }
}

async function main() {
  await expectDenied(
    '비로그인 사용자의 Owner 문서 읽기',
    () => getDoc(ownerVault),
  );

  await signInWithEmailAndPassword(
    auth,
    'attacker@vault.test',
    'VaultArena123!',
  );

  await expectDenied(
    'Attacker의 Owner 문서 읽기',
    () => getDoc(ownerVault),
  );

  await expectDenied(
    'Attacker의 Owner 문서 수정',
    () =>
      updateDoc(ownerVault, {
        title: 'Compromised',
      }),
  );

  await expectDenied(
    'Attacker의 Owner 문서 삭제',
    () => deleteDoc(ownerVault),
  );

  await signOut(auth);

  await signInWithEmailAndPassword(
    auth,
    'owner@vault.test',
    'VaultArena123!',
  );

  await expectAllowed(
    'Owner의 자기 문서 읽기',
    async () => {
      const snapshot = await getDoc(ownerVault);

      if (!snapshot.exists()) {
        throw new Error(
          'Owner 문서가 존재하지 않습니다.',
        );
      }

      const data = snapshot.data();

      if (
        typeof data.secret !== 'string' ||
        !data.secret.startsWith('ARENA_FLAG_')
      ) {
        throw new Error(
          'Secret 형식이 올바르지 않습니다.',
        );
      }
    },
  );

  await expectAllowed(
    'Owner의 자기 문서 수정',
    async () => {
      await updateDoc(ownerVault, {
        title: 'Owner Verified',
      });

      const snapshot = await getDoc(ownerVault);

      if (
        snapshot.data()?.title !==
        'Owner Verified'
      ) {
        throw new Error(
          '수정 결과가 저장되지 않았습니다.',
        );
      }

      await updateDoc(ownerVault, {
        title: 'Private Vault',
      });
    },
  );

  await signOut(auth);

  const passed =
    results.filter((result) => result.passed).length;

  const failed =
    results.length - passed;

  await mkdir('reports', {
    recursive: true,
  });

  await writeFile(
    'reports/public-judge.json',
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        passed,
        failed,
        results,
      },
      null,
      2,
    ),
    'utf8',
  );

  console.table(
    results.map((result) => ({
      테스트: result.name,
      결과: result.passed
        ? 'PASS'
        : 'FAIL',
    })),
  );

  console.log(
    `Public judge: ${passed} passed, ${failed} failed`,
  );

  await deleteApp(app);

  if (failed > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error('Public judge 실행 실패');
  console.error(error);
  process.exitCode = 1;
});
