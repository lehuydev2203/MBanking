import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Decimal128 } from 'mongodb';

export interface ApiResponse<T> {
  success: true;
  data: T;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        // Transform Decimal128 to number with 2 decimal places
        const transformedData = this.transformDecimal128(data);

        return {
          success: true,
          data: transformedData,
        };
      }),
    );
  }

  private transformDecimal128(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (obj instanceof Decimal128) {
      return parseFloat(obj.toString());
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.transformDecimal128(item));
    }

    if (typeof obj === 'object') {
      const transformed: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          transformed[key] = this.transformDecimal128(obj[key]);
        }
      }
      return transformed;
    }

    return obj;
  }
}
