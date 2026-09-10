import { DbClient } from '../../../database/types/database.types';
import { CreateWompiIntentData, WompiIntentRow, WompiIntentStatus } from '../domain/wompi.types';

export interface IWompiIntentsRepository {
  create(data: CreateWompiIntentData, createdBy: string | undefined, client?: DbClient): Promise<WompiIntentRow>;
  findByReference(reference: string, client?: DbClient): Promise<WompiIntentRow | null>;
  markResolved(
    id: string,
    status: WompiIntentStatus,
    wompiTransactionId: string,
    paymentId: string | null,
    client?: DbClient,
  ): Promise<WompiIntentRow | null>;
}

export const WOMPI_INTENTS_REPOSITORY = Symbol('WOMPI_INTENTS_REPOSITORY');
