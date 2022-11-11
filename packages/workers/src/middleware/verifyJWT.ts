import type {
  EmulatorEnv,
  FirebaseIdToken,
} from 'firebase-auth-cloudflare-workers';
import { Auth, WorkersKVStoreSingle } from 'firebase-auth-cloudflare-workers';

// ① ライブラリで提供されている EmulatorEnv を extend する
interface Bindings extends EmulatorEnv {
  PROJECT_ID: string;
  PUBLIC_JWK_CACHE_KEY: string;
  PUBLIC_JWK_CACHE_KV: KVNamespace;
  FIREBASE_AUTH_EMULATOR_HOST: string;
}

export const verifyJWT = async (
  req: Request,
  env: Bindings
): Promise<FirebaseIdToken | null> => {
  const authorization = req.headers.get('Authorization');
  if (authorization === null) {
    return null;
  }

  const jwt = authorization.replace(/Bearer\s+/i, '');

  // ② ライブラリで提供される API を利用するために初期化
  const auth = Auth.getOrInitialize(
    env.PROJECT_ID,
    WorkersKVStoreSingle.getOrInitialize(
      env.PUBLIC_JWK_CACHE_KEY,
      env.PUBLIC_JWK_CACHE_KV
    )
  );

  // ③ リクエストされた JWT を検証する
  return auth.verifyIdToken(jwt, env);
};
