import { applyDecorators, BadRequestException } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsDate } from 'class-validator';
import { REGEX } from '../constants/extrnal.constant';

export const MMDDYYYYDate = (
  field = 'startDate',
  message = `${field} must be in MMDDYYYY format`,
) =>
  applyDecorators(
    Transform(({ value }) => {
      const s = String(value ?? '').trim();
      console.log('date', s);
      if (!REGEX.MMDDYYYY.test(s)) {
        throw new BadRequestException(message);
      }

      const mm = +s.slice(0, 2) - 1;
      const dd = +s.slice(2, 4);
      const yyyy = +s.slice(4, 8);
      const d = new Date(yyyy, mm, dd);

      if (d.getFullYear() !== yyyy || d.getMonth() !== mm || d.getDate() !== dd) {
        throw new BadRequestException(`${field} is not a valid calendar date`);
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (d < today) {
        throw new BadRequestException(`${field} cannot be a past date`);
      }

      return d;
    }),
    IsDate(),
  );
