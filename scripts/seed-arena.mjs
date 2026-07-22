import { randomBytes, createHash } from 'node:crypto';
import { mkdir, writeFile, chmod } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { initializeApp, deleteApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const PROJECT_ID = 'demo-vault-arena';

process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
process.env.GCLOUD_PROJECT = PROJECT_ID;

async function resetEmulators() {
  const authResponse = await fetch(
    `http://127.0.0.1:9099/emulator/v1/projects/${PROJECT_ID}/accounts`,
    { method: 'DELETE' },
  );

  if (!authResponse.ok) {
    throw new Error(
      `Auth reset failed: ${authResponse.status} ${await authResponse.text()}`,
    );
  }

  const firestoreResponse = await fetch(
    `http://127.0.0.1:8080/emulator/v1/projects/${PROJECT_ID}/databases/(default)/documents`,
    { method: 'DELETE' },
  );

  if (!firestoreResponse.ok) {
    throw new Error(
      `Firestore reset failed: ${firestoreResponse.status} ${await firestoreResponse.text()}`,
    );
  }
}

async function main() {
  await resetEmulators();

  const app = initializeApp({
    projectId: PROJECT_ID,
  });

  const auth = getAuth(app);
  const db = getFirestore(app);

  await auth.createUser({
    uid: 'owner-test-001',
    email: 'owner@vault.test',
    password: 'VaultArena123!',
    displayName: 'Vault Owner',
  });

  await auth.createUser({
    uid: 'attacker-test-001',
    email: 'attacker@vault.test',
    password: 'VaultArena123!',
    displayName: 'Vault Attacker',
  });

  const flag =
    `ARENA_FLAG_${randomBytes(24).toString('hex').toUpperCase()}`;

  await db
    .doc('vaults/owner-test-001/items/main')
    .set({
      ownerUid: 'owner-test-001',
      title: 'Private Vault',
      secret: flag,
      updatedAt: new Date(),
    });

  await db
    .doc('vaults/attacker-test-001/items/main')
    .set({
      ownerUid: 'attacker-test-001',
      title: 'Attacker Vault',
      secret: 'ATTACKER_OWN_DATA',
      updatedAt: new Date(),
    });

  const flagHash = createHash('sha256')
    .update(flag)
    .digest('hex');

  const privateDir = join(
    homedir(),
    'Developer',
    'vault-arena-judge',
  );

  await mkdir(privateDir, {
    recursive: true,
  });

  const privatePath = join(
    privateDir,
    'current-seed.json',
  );

  await writeFile(
    privatePath,
    JSON.stringify(
      {
        projectId: PROJECT_ID,
        ownerUid: 'owner-test-001',
        attackerUid: 'attacker-test-001',
        flag,
        flagHash,
        createdAt: new Date().toISOString(),
      },
      null,
      2,
    ),
    'utf8',
  );

  await chmod(privatePath, 0o600);

  console.log('');
  console.log('VaultArena seed completed');
  console.log('Owner UID: owner-test-001');
  console.log('Attacker UID: attacker-test-001');
  console.log(`Flag SHA-256: ${flagHash}`);
  console.log('Actual flag is stored only in the external judge directory');

  await deleteApp(app);
}

main().catch((error) => {
  console.error('');
  console.error('Seed failed');
  console.error(error);
  process.exitCode = 1;
});
