import Joi from 'joi';

export const withdrawSchema = Joi.object({
  amount: Joi.number().positive().required(),
});

export interface WithdrawDto {
  amount: number;
}
