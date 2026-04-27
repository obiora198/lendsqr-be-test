import Joi from 'joi';

export const registerSchema = Joi.object({
  name: Joi.string().max(100).required(),
  email: Joi.string().email().max(100).required(),
  phone: Joi.string().max(20).required(),
  bvn: Joi.string().length(11).required(), // BVN is usually 11 digits
  password: Joi.string().min(8).required(),
});

export interface RegisterDto {
  name: string;
  email: string;
  phone: string;
  bvn: string;
  password: string;
}
