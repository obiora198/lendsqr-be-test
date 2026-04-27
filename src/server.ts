import express from 'express';
import dotenv from 'dotenv';

import authRoutes from './modules/auth/auth.routes';
import walletRoutes from './modules/wallet/wallet.routes';
import { errorMiddleware } from './middlewares/error.middleware';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/wallet', walletRoutes);

app.use(errorMiddleware);

app.get('/', (req, res) => {
  res.send('Demo Credit Wallet Service API');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
