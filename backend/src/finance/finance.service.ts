import { BadRequestException, Injectable } from '@nestjs/common';
@Injectable()
export class FinanceService {
  private async db() {
    return getDatabasePool().connect();
  }

  async findAll(from?: string, to?: string) {
    const client = await this.db();

    try {
      const result = await client.query(
        `
        SELECT *
        FROM finance_transactions
        WHERE
          ($1::date IS NULL OR transaction_date >= $1::date)
          AND
          ($2::date IS NULL OR transaction_date <= $2::date)
        ORDER BY transaction_date DESC, created_at DESC
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
        SELECT *
        FROM finance_transactions
        WHERE id = $1
        `,
        [id],
      );

      if (result.rows.length === 0) {
        throw new BadRequestException(
          'Finance transaction not found',
        );
      }

      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async create(data: {
    transactionDate: string;
    transactionType: string;
    category: string;
    amount: number | string;
    description?: string;
  }) {
    if (!data.transactionDate) {
      throw new BadRequestException(
        'Transaction date is required',
      );
    }

    const transactionType =
      data.transactionType?.trim().toUpperCase();

    if (
      transactionType !== 'INCOME' &&
      transactionType !== 'EXPENSE'
    ) {
      throw new BadRequestException(
        'Transaction type must be INCOME or EXPENSE',
      );
    }

    if (!data.category?.trim()) {
      throw new BadRequestException('Category is required');
    }

    const amount = Number(data.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestException(
        'Amount must be greater than zero',
      );
    }

    const client = await this.db();

    try {
      const result = await client.query(
        `
        INSERT INTO finance_transactions (
          transaction_date,
          transaction_type,
          category,
          amount,
          description
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
        `,
        [
          data.transactionDate,
          transactionType,
          data.category.trim(),
          amount,
          data.description?.trim() || null,
        ],
      );

      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async update(
    id: string,
    data: {
      transactionDate?: string;
      transactionType?: string;
      category?: string;
      amount?: number | string;
      description?: string;
    },
  ) {
    let transactionType: string | null = null;

    if (data.transactionType !== undefined) {
      transactionType =
        data.transactionType.trim().toUpperCase();

      if (
        transactionType !== 'INCOME' &&
        transactionType !== 'EXPENSE'
      ) {
        throw new BadRequestException(
          'Transaction type must be INCOME or EXPENSE',
        );
      }
    }

    let amount: number | null = null;

    if (data.amount !== undefined) {
      amount = Number(data.amount);

      if (!Number.isFinite(amount) || amount <= 0) {
        throw new BadRequestException(
          'Amount must be greater than zero',
        );
      }
    }

    const client = await this.db();

    try {
      const result = await client.query(
        `
        UPDATE finance_transactions
        SET
          transaction_date =
            COALESCE($1::date, transaction_date),

          transaction_type =
            COALESCE($2, transaction_type),

          category =
            COALESCE($3, category),

          amount =
            COALESCE($4::numeric, amount),

          description =
            COALESCE($5, description),

          updated_at = NOW()

        WHERE id = $6
        RETURNING *
        `,
        [
          data.transactionDate || null,
          transactionType,
          data.category?.trim() || null,
          amount,
          data.description?.trim() || null,
          id,
        ],
      );

      if (result.rows.length === 0) {
        throw new BadRequestException(
          'Finance transaction not found',
        );
      }

      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async remove(id: string) {
    const client = await this.db();

    try {
      const result = await client.query(
        `
        DELETE FROM finance_transactions
        WHERE id = $1
        RETURNING *
        `,
        [id],
      );

      if (result.rows.length === 0) {
        throw new BadRequestException(
          'Finance transaction not found',
        );
      }

      return result.rows[0];
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
          COALESCE(
            SUM(amount) FILTER (
              WHERE transaction_type = 'INCOME'
            ),
            0
          )::numeric(12,2) AS total_income,

          COALESCE(
            SUM(amount) FILTER (
              WHERE transaction_type = 'EXPENSE'
            ),
            0
          )::numeric(12,2) AS total_expenses,

          COUNT(*)::int AS transaction_count
        FROM finance_transactions
        WHERE
          ($1::date IS NULL OR transaction_date >= $1::date)
          AND
          ($2::date IS NULL OR transaction_date <= $2::date)
        `,
        params,
      );

      const breakdownResult = await client.query(
        `
        SELECT
          transaction_type,
          category,
          COALESCE(SUM(amount), 0)::numeric(12,2) AS total,
          COUNT(*)::int AS count
        FROM finance_transactions
        WHERE
          ($1::date IS NULL OR transaction_date >= $1::date)
          AND
          ($2::date IS NULL OR transaction_date <= $2::date)
        GROUP BY transaction_type, category
        ORDER BY transaction_type, category
        `,
        params,
      );

      const totalIncome = Number(
        totalsResult.rows[0].total_income,
      );

      const totalExpenses = Number(
        totalsResult.rows[0].total_expenses,
      );

      return {
        period: {
          from: params[0],
          to: params[1],
        },
        totalIncome,
        totalExpenses,
        balance: totalIncome - totalExpenses,
        transactionCount:
          totalsResult.rows[0].transaction_count,
        breakdown: breakdownResult.rows.map(
          (row) => ({
            transactionType:
              row.transaction_type,
            category: row.category,
            total: Number(row.total),
            count: row.count,
          }),
        ),
      };
    } finally {
      client.release();
    }
   }
}

import { getDatabasePool } from '../database/database-pool';