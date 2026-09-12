import { CanActivate, ExecutionContext, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../../../config/app.config';

/** Hides the whole bank-verification surface (404, not 403) unless BANK_VERIFICATION_ENABLED='true'. */
@Injectable()
export class BankVerificationEnabledGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(_context: ExecutionContext): boolean {
    const enabled = this.configService.getOrThrow<AppConfig>('app').bankVerification.enabled;
    if (!enabled) {
      throw new NotFoundException('Route not found');
    }
    return true;
  }
}
