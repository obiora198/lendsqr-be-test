import { Router } from 'express';
import { WalletController } from './wallet.controller';
import { fundSchema } from './dto/fund.dto';
import { transferSchema } from './dto/transfer.dto';
import { withdrawSchema } from './dto/withdraw.dto';
import { validate } from '../../middlewares/validate.middleware';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/fund', validate(fundSchema), WalletController.fund);
router.post('/transfer', validate(transferSchema), WalletController.transfer);
router.post('/withdraw', validate(withdrawSchema), WalletController.withdraw);
router.get('/balance', WalletController.getBalance);
router.get('/transactions', WalletController.getTransactions);

export default router;
