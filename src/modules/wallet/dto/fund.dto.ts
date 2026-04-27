import Joi from 'joi';

export const fundSchema = Joi.object({
  amount: Joi.number().positive().required(),
});

export interface FundDto {
  amount: number;
}
