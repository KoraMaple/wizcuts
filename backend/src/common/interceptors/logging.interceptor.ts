import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context
      .switchToHttp()
      .getRequest<Request & { method?: string; url?: string }>();
    const method = req?.method ?? 'UNKNOWN';
    const url = req?.url ?? '';
    const started = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const elapsed = Date.now() - started;
          this.logger.log(`${method} ${url} ${elapsed}ms`);
        },
        error: (err: unknown) => {
          const elapsed = Date.now() - started;
          this.logger.error(
            `${method} ${url} ${elapsed}ms -> ${String((err as any)?.message ?? err)}`
          );
        },
      })
    );
  }
}
