import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { REGEX } from '../constants/extrnal.constant';
import { parseTemplate } from '../utils/util';
import { ValidationMessages } from '../constants/validation-messages.constant';

@ValidatorConstraint({ name: 'IsEmailOrPhone', async: false })
export class IsEmailOrPhoneValidator implements ValidatorConstraintInterface {
  validate(value: string): boolean {
    if (typeof value !== 'string') return false;
    return REGEX.EMAIL.test(value) || REGEX.PHONE.test(value);
  }
  defaultMessage?(args?: ValidationArguments): string {
    return parseTemplate(ValidationMessages.INVALID_EMAIL_PHONE_MESSAGE, { value: args?.value });
  }
}
