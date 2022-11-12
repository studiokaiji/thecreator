import {
  getFirebaseToken,
  verifyFirebaseAuth,
  VerifyFirebaseAuthEnv,
} from '@honojs/firebase-auth';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

const config = {
  projectId: 'melt-thecreator',
};

const app = new Hono<{ Bindings: VerifyFirebaseAuthEnv }>();

app.use(
  '*',
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
  return c.json('Hello');
});

app.get('/echo-id-token', (c) => {
  const idToken = getFirebaseToken(c);
  return c.json(idToken);
});

export default app;
