import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { DbClient } from '../../../database/types/database.types';
import { BusinessRow } from '../domain/business.interface';
import {
  CreateBusinessData,
  UpdateBusinessData,
} from '../domain/business.types';
import { IBusinessesRepository } from './businesses.repository.interface';

const SELECT_COLUMNS = `id, name, legal_name, tax_id, email, phone, currency, timezone, tax_rate, loyalty_points_per_thousand, loyalty_birthday_bonus_enabled, loyalty_birthday_bonus_points, is_active, created_at, updated_at`;

@Injectable()
export class BusinessesRepository implements IBusinessesRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(
    data: CreateBusinessData,
    client?: DbClient,
  ): Promise<BusinessRow> {
    const result = await this.db.query<BusinessRow>(
      `INSERT INTO businesses (name, legal_name, tax_id, email, phone, currency, timezone)
       VALUES ($1, $2, $3, $4, $5, COALESCE($6, 'COP'), COALESCE($7, 'America/Bogota'))
       RETURNING ${SELECT_COLUMNS}`,
      [
        data.name,
        data.legalName ?? null,
        data.taxId ?? null,
        data.email ?? null,
        data.phone ?? null,
        data.currency ?? null,
        data.timezone ?? null,
      ],
      client,
    );
    return result.rows[0];
  }

  async findById(id: string, client?: DbClient): Promise<BusinessRow | null> {
    const result = await this.db.query<BusinessRow>(
      `SELECT ${SELECT_COLUMNS} FROM businesses WHERE id = $1`,
      [id],
      client,
    );
    return result.rows[0] ?? null;
  }

  async update(
    id: string,
    data: UpdateBusinessData,
    client?: DbClient,
  ): Promise<BusinessRow | null> {
    const result = await this.db.query<BusinessRow>(
      `UPDATE businesses
       SET name = COALESCE($2, name),
           legal_name = COALESCE($3, legal_name),
           tax_id = COALESCE($4, tax_id),
           email = COALESCE($5, email),
           phone = COALESCE($6, phone),
           currency = COALESCE($7, currency),
           timezone = COALESCE($8, timezone)
       WHERE id = $1
       RETURNING ${SELECT_COLUMNS}`,
      [
        id,
        data.name ?? null,
        data.legalName ?? null,
        data.taxId ?? null,
        data.email ?? null,
        data.phone ?? null,
        data.currency ?? null,
        data.timezone ?? null,
      ],
      client,
    );
    return result.rows[0] ?? null;
  }

  async setActive(
    id: string,
    isActive: boolean,
    client?: DbClient,
  ): Promise<BusinessRow | null> {
    const result = await this.db.query<BusinessRow>(
      `UPDATE businesses SET is_active = $2 WHERE id = $1 RETURNING ${SELECT_COLUMNS}`,
      [id, isActive],
      client,
    );
    return result.rows[0] ?? null;
  }

  async updateTaxRate(
    id: string,
    taxRate: number,
    client?: DbClient,
  ): Promise<BusinessRow | null> {
    const result = await this.db.query<BusinessRow>(
      `UPDATE businesses SET tax_rate = $2 WHERE id = $1 RETURNING ${SELECT_COLUMNS}`,
      [id, taxRate],
      client,
    );
    return result.rows[0] ?? null;
  }

  async updateLoyaltyConfig(
    id: string,
    data: {
      pointsPerThousand?: number;
      birthdayBonusEnabled?: boolean;
      birthdayBonusPoints?: number;
    },
    client?: DbClient,
  ): Promise<BusinessRow | null> {
    const result = await this.db.query<BusinessRow>(
      `UPDATE businesses
       SET loyalty_points_per_thousand = COALESCE($2, loyalty_points_per_thousand),
           loyalty_birthday_bonus_enabled = COALESCE($3, loyalty_birthday_bonus_enabled),
           loyalty_birthday_bonus_points = COALESCE($4, loyalty_birthday_bonus_points)
       WHERE id = $1
       RETURNING ${SELECT_COLUMNS}`,
      [
        id,
        data.pointsPerThousand ?? null,
        data.birthdayBonusEnabled ?? null,
        data.birthdayBonusPoints ?? null,
      ],
      client,
    );
    return result.rows[0] ?? null;
  }
}
