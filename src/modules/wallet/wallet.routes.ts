import { Router } from 'express';
import { WalletController } from './wallet.controller';
import { fundSchema } from './dto/fund.dto';
import { transferSchema } from './dto/transfer.dto';
import { validate } from '../../middlewares/validate.middleware';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/fund', validate(fundSchema), WalletController.fund);
router.post('/transfer', validate(transferSchema), WalletController.transfer);

export default router;
