import { SetMetadata } from '@nestjs/common';
import type { UserRole } from '@prisma/client';

export const ROLES_KEY = 'roles';

/** Require one of these staff roles to access the route. */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
