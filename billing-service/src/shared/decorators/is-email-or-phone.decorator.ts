import { Validate } from 'class-validator';
import { IsEmailOrPhoneValidator } from '../validators/is-email-or-phone.validator';

export const IsEmailOrPhone = (): PropertyDecorator => {
  return Validate(IsEmailOrPhoneValidator);
};
