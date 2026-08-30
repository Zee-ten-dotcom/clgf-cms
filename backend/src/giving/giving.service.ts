import { BadRequestException, Injectable } from '@nestjs/common';
@Injectable()
export class GivingService {
  private async db() {
    return getDatabasePool().connect();
  }

  async findAll(from?: string, to?: string) {
    const client = await this.db();

    try {
      const result = await client.query(
        `
        SELECT
          g.*,
          m.membership_number,
          m.first_name,
          m.last_name
        FROM giving_records g
        LEFT JOIN members m
          ON m.id = g.member_id
        WHERE
          ($1::date IS NULL OR g.giving_date >= $1::date)
          AND
          ($2::date IS NULL OR g.giving_date <= $2::date)
        ORDER BY g.giving_date DESC, g.created_at DESC
        `,
        [
          from?.trim() || null,
          to?.trim() || null,
        ],
      );

      return result.rows;
    } finally {
      client.release();
    }
  }

  async findOne(id: string) {
    const client = await this.db();

    try {
      const result = await client.query(
        `
        SELECT
          g.*,
          m.membership_number,
          m.first_name,
          m.last_name
        FROM giving_records g
        LEFT JOIN members m
          ON m.id = g.member_id
        WHERE g.id = $1
        `,
        [id],
      );

      if (result.rows.length === 0) {
        throw new BadRequestException('Giving record not found');
      }

      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async create(data: {
    memberId?: string;
    givingDate: string;
    givingType: string;
    amount: number | string;
    paymentMethod?: string;
    referenceNumber?: string;
    notes?: string;
  }) {
    if (!data.givingDate) {
      throw new BadRequestException('Giving date is required');
    }

    if (!data.givingType?.trim()) {
      throw new BadRequestException('Giving type is required');
    }

    const amount = Number(data.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestException(
        'Amount must be greater than zero',
      );
    }

    const client = await this.db();

    try {
      await client.query('BEGIN');

      const financeResult = await client.query(
        `
        INSERT INTO finance_transactions (
          transaction_date,
          transaction_type,
          category,
          amount,
          description
        )
        VALUES ($1, 'INCOME', $2, $3, $4)
        RETURNING id
        `,
        [
          data.givingDate,
          data.givingType.trim(),
          amount,
          data.notes?.trim() || null,
        ],
      );

      const financeTransactionId =
        financeResult.rows[0].id;

      const givingResult = await client.query(
        `
        INSERT INTO giving_records (
          member_id,
          giving_date,
          giving_type,
          amount,
          payment_method,
          reference_number,
          notes,
          finance_transaction_id
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
        `,
        [
          data.memberId || null,
          data.givingDate,
          data.givingType.trim(),
          amount,
          data.paymentMethod?.trim() || null,
          data.referenceNumber?.trim() || null,
          data.notes?.trim() || null,
          financeTransactionId,
        ],
      );

      await client.query('COMMIT');

      return givingResult.rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

    async update(
    id: string,
    data: {
      memberId?: string | null;
      givingDate?: string;
      givingType?: string;
      amount?: number | string;
      paymentMethod?: string | null;
      referenceNumber?: string | null;
      notes?: string | null;
    },
  ) {
    const client = await this.db();

    try {
      await client.query('BEGIN');

      const existingResult = await client.query(
        `
        SELECT *
        FROM giving_records
        WHERE id = $1
        `,
        [id],
      );

      if (existingResult.rows.length === 0) {
        throw new BadRequestException(
          'Giving record not found',
        );
      }

      const existing = existingResult.rows[0];

      const givingDate =
        data.givingDate || existing.giving_date;

      const givingType =
        data.givingType !== undefined
          ? data.givingType.trim()
          : existing.giving_type;

      if (!givingType) {
        throw new BadRequestException(
          'Giving type is required',
        );
      }

      const amount =
        data.amount !== undefined
          ? Number(data.amount)
          : Number(existing.amount);

      if (!Number.isFinite(amount) || amount <= 0) {
        throw new BadRequestException(
          'Amount must be greater than zero',
        );
      }

      const memberId =
        data.memberId !== undefined
          ? data.memberId || null
          : existing.member_id;

      const paymentMethod =
        data.paymentMethod !== undefined
          ? data.paymentMethod?.trim() || null
          : existing.payment_method;

      const referenceNumber =
        data.referenceNumber !== undefined
          ? data.referenceNumber?.trim() || null
          : existing.reference_number;

      const notes =
        data.notes !== undefined
          ? data.notes?.trim() || null
          : existing.notes;

      const givingResult = await client.query(
        `
        UPDATE giving_records
        SET
          member_id = $1,
          giving_date = $2,
          giving_type = $3,
          amount = $4,
          payment_method = $5,
          reference_number = $6,
          notes = $7,
          updated_at = NOW()
        WHERE id = $8
        RETURNING *
        `,
        [
          memberId,
          givingDate,
          givingType,
          amount,
          paymentMethod,
          referenceNumber,
          notes,
          id,
        ],
      );

      if (existing.finance_transaction_id) {
        await client.query(
          `
          UPDATE finance_transactions
          SET
            transaction_date = $1,
            transaction_type = 'INCOME',
            category = $2,
            amount = $3,
            description = $4,
            updated_at = NOW()
          WHERE id = $5
          `,
          [
            givingDate,
            givingType,
            amount,
            notes,
            existing.finance_transaction_id,
          ],
        );
      }

      await client.query('COMMIT');

      return givingResult.rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async remove(id: string) {
    const client = await this.db();

    try {
      await client.query('BEGIN');

      const givingResult = await client.query(
        `
        DELETE FROM giving_records
        WHERE id = $1
        RETURNING *
        `,
        [id],
      );

      if (givingResult.rows.length === 0) {
        throw new BadRequestException(
          'Giving record not found',
        );
      }

      const financeTransactionId =
        givingResult.rows[0].finance_transaction_id;

      if (financeTransactionId) {
        await client.query(
          `
          DELETE FROM finance_transactions
          WHERE id = $1
          `,
          [financeTransactionId],
        );
      }

      await client.query('COMMIT');

      return givingResult.rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
      

    async getSummary(from?: string, to?: string) {
    const client = await this.db();

    try {
      const params = [
        from?.trim() || null,
        to?.trim() || null,
      ];

      const totalsResult = await client.query(
        `
        SELECT
          COALESCE(SUM(amount), 0)::numeric(12,2) AS total_giving,
          COUNT(*)::int AS giving_count
        FROM giving_records
        WHERE
          ($1::date IS NULL OR giving_date >= $1::date)
          AND
          ($2::date IS NULL OR giving_date <= $2::date)
        `,
        params,
      );

      const breakdownResult = await client.query(
        `
        SELECT
          giving_type,
          COALESCE(SUM(amount), 0)::numeric(12,2) AS total,
          COUNT(*)::int AS count
        FROM giving_records
        WHERE
          ($1::date IS NULL OR giving_date >= $1::date)
          AND
          ($2::date IS NULL OR giving_date <= $2::date)
        GROUP BY giving_type
        ORDER BY giving_type
        `,
        params,
      );

      return {
        totalGiving: Number(
          totalsResult.rows[0].total_giving,
        ),
        givingCount:
          totalsResult.rows[0].giving_count,
        breakdown: breakdownResult.rows.map(
          (row) => ({
            givingType: row.giving_type,
            total: Number(row.total),
            count: row.count,
          }),
        ),
        period: {
          from: params[0],
          to: params[1],
        },
      };
    } finally {
      client.release();
    }
  }
   
}

import { getDatabasePool } from '../database/database-pool';