import {
  getFirebaseToken,
  verifyFirebaseAuth,
  VerifyFirebaseAuthEnv,
} from '@honojs/firebase-auth';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

interface Env extends VerifyFirebaseAuthEnv {
  CHAIN_ID: number;
  CHAIN_RPC_ENDPOINT: string;
  CHAIN_RPC_ENDPOINT_1: string;
  CHAIN_RPC_ENDPOINT_2: string;
  MULTICALL_CONTRACT_ADDRESS: string;
}

const config = {
  projectId: 'melt-thecreator',
};

const app = new Hono<{ Bindings: Env }>();

app.use(
  '/echo-id-token',
  cors({
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['POST', 'GET', 'OPTIONS'],
    credentials: true,
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
    origin: 'http://localhost:5173',
  }),
  verifyFirebaseAuth(config)
);

app.get('/hello', (c) => {
  return c.json({ CHAIN_ID: c.env.CHAIN_ID });
});

app.get('/echo-id-token', (c) => {
  const idToken = getFirebaseToken(c);
  return c.json(idToken);
});

export default app;
