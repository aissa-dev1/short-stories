import { applyDecorators, Logger, SetMetadata } from '@nestjs/common';
import { MarkForDeletionReason } from '../constants/mark-for-deletion-reason.constant';

const logger = new Logger('MarkForDeletion');

export function MarkForDeletion(reason: MarkForDeletionReason | string) {
  return applyDecorators(
    SetMetadata('markForDeletion', true),
    SetMetadata('deletionReason', reason),
    (
      target: object,
      propertyKey: string | symbol,
      descriptor: PropertyDescriptor,
    ) => {
      const originalMethod = descriptor.value;
      descriptor.value = function (...args: any[]) {
        logger.warn(
          `Mark for deletion endpoint accessed: ${target.constructor.name}.${String(propertyKey)}`,
        );
        logger.warn(`Mark for deletion reason: ${reason}`);
        return originalMethod.apply(this, args);
      };
      return descriptor;
    },
  );
}
