import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { map, Observable } from 'rxjs';

function transform(value: unknown): unknown {
  if (value === null || value === undefined) return value;

  // Prisma's Decimal → number
  if (value instanceof Decimal || Decimal.isDecimal(value)) {
    return Number(value);
  }

  // Native BigInt → string (JSON.stringify chokes on bigint)
  if (typeof value === 'bigint') return value.toString();

  // Date stays as-is (Express serializes to ISO string)
  if (value instanceof Date) return value;

  if (Array.isArray(value)) return value.map(transform);

  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = transform(v);
    }
    return out;
  }
  return value;
}

@Injectable()
export class DecimalToNumberInterceptor implements NestInterceptor {
  intercept(_ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(map((data) => transform(data)));
  }
}
