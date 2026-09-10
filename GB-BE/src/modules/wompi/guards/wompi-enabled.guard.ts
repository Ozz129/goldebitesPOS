import { CanActivate, ExecutionContext, Injectable, NotFoundException } from '@nestjs/common';
import { WompiService } from '../services/wompi.service';

/**
 * Global kill switch for the whole Wompi checkout surface. Responds 404 (not 403) so the
 * feature stays invisible — matching how it's hidden client-side too — until WOMPI_PAYMENTS_ENABLED
 * is turned on.
 */
@Injectable()
export class WompiEnabledGuard implements CanActivate {
  constructor(private readonly wompiService: WompiService) {}

  canActivate(_context: ExecutionContext): boolean {
    if (!this.wompiService.isEnabled()) {
      throw new NotFoundException();
    }
    return true;
  }
}
