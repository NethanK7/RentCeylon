import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@rentloop/shared';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
