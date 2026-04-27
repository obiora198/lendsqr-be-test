import { Router } from 'express';
import { AuthController } from './auth.controller';
import { registerSchema } from './dto/register.dto';
import { loginSchema } from './dto/login.dto';
import { validate } from '../../middlewares/validate.middleware';

const router = Router();

router.post('/register', validate(registerSchema), AuthController.register);
router.post('/login', validate(loginSchema), AuthController.login);

export default router;
