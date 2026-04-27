import Joi from 'joi';

export const transferSchema = Joi.object({
  recipientEmail: Joi.string().email().required(),
  amount: Joi.number().positive().required(),
});

export interface TransferDto {
  recipientEmail: string;
  amount: number;
}
