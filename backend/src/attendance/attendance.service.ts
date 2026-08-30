import { BadRequestException, Injectable } from '@nestjs/common';
@Injectable()
export class AttendanceService {
  private async db() {
    return getDatabasePool().connect();
  }

  async findAllSessions() {
    const client = await this.db();

    try {
      const result = await client.query(`
        SELECT
          s.*,
          e.id AS event_id,
          e.title AS event_title,
          e.event_type,
          e.status AS event_status,
          COUNT(r.id) FILTER (
            WHERE r.status = 'PRESENT'
          )::int AS attendance_count
        FROM attendance_sessions s
        LEFT JOIN events e
          ON e.attendance_session_id = s.id
        LEFT JOIN attendance_records r
          ON r.session_id = s.id
        GROUP BY s.id, e.id
        ORDER BY s.service_date DESC, s.created_at DESC
      `);

      return result.rows;
    } finally {
      client.release();
    }
  }

  async findSession(id: string) {
    const client = await this.db();

    try {
      const sessionResult = await client.query(
        `
        SELECT
          s.*,
          e.id AS event_id,
          e.title AS event_title,
          e.event_type,
          e.status AS event_status
        FROM attendance_sessions s
        LEFT JOIN events e
          ON e.attendance_session_id = s.id
        WHERE s.id = $1
        `,
        [id],
      );

      if (sessionResult.rows.length === 0) {
        throw new BadRequestException('Attendance session not found');
      }

      const recordsResult = await client.query(
        `
        SELECT
          r.*,
          m.membership_number,
          m.first_name,
          m.last_name
        FROM attendance_records r
        INNER JOIN members m
          ON m.id = r.member_id
        WHERE r.session_id = $1
        ORDER BY m.first_name, m.last_name
        `,
        [id],
      );

      return {
        ...sessionResult.rows[0],
        records: recordsResult.rows,
      };
    } finally {
      client.release();
    }
  }

  async createSession(data: {
    serviceDate: string;
    serviceType: string;
    notes?: string;
  }) {
    if (!data.serviceDate) {
      throw new BadRequestException('Service date is required');
    }

    if (!data.serviceType?.trim()) {
      throw new BadRequestException('Service type is required');
    }

    const client = await this.db();

    try {
      const result = await client.query(
        `
        INSERT INTO attendance_sessions (
          service_date,
          service_type,
          notes
        )
        VALUES ($1, $2, $3)
        RETURNING *
        `,
        [
          data.serviceDate,
          data.serviceType.trim(),
          data.notes?.trim() || null,
        ],
      );

      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async markAttendance(
    sessionId: string,
    data: {
      memberId: string;
      status?: string;
    },
  ) {
    if (!data.memberId) {
      throw new BadRequestException('Member ID is required');
    }

    const status = data.status?.trim().toUpperCase() || 'PRESENT';

    const client = await this.db();

    try {
      const result = await client.query(
        `
        INSERT INTO attendance_records (
          session_id,
          member_id,
          status
        )
        VALUES ($1, $2, $3)
        ON CONFLICT (session_id, member_id)
        DO UPDATE SET
          status = EXCLUDED.status
        RETURNING *
        `,
        [sessionId, data.memberId, status],
      );

      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async removeAttendance(sessionId: string, memberId: string) {
    const client = await this.db();

    try {
      const result = await client.query(
        `
        DELETE FROM attendance_records
        WHERE session_id = $1
          AND member_id = $2
        RETURNING *
        `,
        [sessionId, memberId],
      );

      if (result.rows.length === 0) {
        throw new BadRequestException('Attendance record not found');
      }

      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async removeSession(id: string) {
    const client = await this.db();

    try {
      const result = await client.query(
        `
        DELETE FROM attendance_sessions
        WHERE id = $1
        RETURNING *
        `,
        [id],
      );

      if (result.rows.length === 0) {
        throw new BadRequestException('Attendance session not found');
      }

      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async getMemberHistory(memberId: string) {
    const client = await this.db();

    try {
      const memberResult = await client.query(
        `
        SELECT
          id,
          membership_number,
          first_name,
          last_name,
          status
        FROM members
        WHERE id = $1
        `,
        [memberId],
      );

      if (memberResult.rows.length === 0) {
        throw new BadRequestException('Member not found');
      }

      const historyResult = await client.query(
        `
        SELECT
          s.id AS session_id,
          s.service_date,
          s.service_type,
          s.notes,
          COALESCE(r.status, 'NOT_MARKED') AS attendance_status
        FROM attendance_sessions s
        LEFT JOIN attendance_records r
          ON r.session_id = s.id
          AND r.member_id = $1
        ORDER BY s.service_date DESC, s.created_at DESC
        `,
        [memberId],
      );

      const history = historyResult.rows;

      const present = history.filter(
        (item) => item.attendance_status === 'PRESENT',
      ).length;

      const absent = history.filter(
        (item) => item.attendance_status === 'ABSENT',
      ).length;

      const notMarked = history.filter(
        (item) => item.attendance_status === 'NOT_MARKED',
      ).length;

      const totalSessions = history.length;

      const attendanceRate =
        totalSessions > 0
          ? Number(((present / totalSessions) * 100).toFixed(1))
          : 0;

      return {
        member: memberResult.rows[0],
        summary: {
          totalSessions,
          present,
          absent,
          notMarked,
          attendanceRate,
        },
        history,
      };
    } finally {
      client.release();
    }
  }
    async getAttendanceReport(from?: string, to?: string) {
    const client = await this.db();

    const params = [
      from?.trim() || null,
      to?.trim() || null,
    ];

    try {
      const sessionsResult = await client.query(
        `
        SELECT
          COUNT(*)::int AS total_sessions
        FROM attendance_sessions
        WHERE
          ($1::date IS NULL OR service_date >= $1::date)
          AND
          ($2::date IS NULL OR service_date <= $2::date)
        `,
        params,
      );

      const membersResult = await client.query(`
        SELECT
          COUNT(*)::int AS total_active_members
        FROM members
        WHERE status = 'ACTIVE'
      `);

      const recordsResult = await client.query(
        `
        SELECT
          COUNT(*) FILTER (
            WHERE r.status = 'PRESENT'
          )::int AS present,

          COUNT(*) FILTER (
            WHERE r.status = 'ABSENT'
          )::int AS absent

        FROM attendance_records r

        INNER JOIN attendance_sessions s
          ON s.id = r.session_id

        WHERE
          ($1::date IS NULL OR s.service_date >= $1::date)
          AND
          ($2::date IS NULL OR s.service_date <= $2::date)
        `,
        params,
      );

      const memberStatsResult = await client.query(
        `
        SELECT
          m.id,
          m.membership_number,
          m.first_name,
          m.last_name,

          COUNT(s.id)::int AS total_sessions,

          COUNT(r.id) FILTER (
            WHERE r.status = 'PRESENT'
          )::int AS present,

          COUNT(r.id) FILTER (
            WHERE r.status = 'ABSENT'
          )::int AS absent,

          (
            COUNT(s.id) -
            COUNT(r.id)
          )::int AS not_marked

        FROM members m

        LEFT JOIN attendance_sessions s
          ON (
            ($1::date IS NULL OR s.service_date >= $1::date)
            AND
            ($2::date IS NULL OR s.service_date <= $2::date)
          )

        LEFT JOIN attendance_records r
          ON r.session_id = s.id
          AND r.member_id = m.id

        WHERE m.status = 'ACTIVE'

        GROUP BY
          m.id,
          m.membership_number,
          m.first_name,
          m.last_name

        ORDER BY
          m.first_name,
          m.last_name
        `,
        params,
      );

      const totalSessions =
        sessionsResult.rows[0].total_sessions;

      const totalActiveMembers =
        membersResult.rows[0].total_active_members;

      const present =
        recordsResult.rows[0].present;

      const absent =
        recordsResult.rows[0].absent;

      const possibleAttendances =
        totalSessions * totalActiveMembers;

      const attendanceRate =
        possibleAttendances > 0
          ? Number(
              (
                (present / possibleAttendances) *
                100
              ).toFixed(1),
            )
          : 0;

      const members = memberStatsResult.rows.map(
        (member) => ({
          ...member,
          attendance_rate:
            member.total_sessions > 0
              ? Number(
                  (
                    (member.present /
                      member.total_sessions) *
                    100
                  ).toFixed(1),
                )
              : 0,
        }),
      );

      return {
        period: {
          from: params[0],
          to: params[1],
        },
        summary: {
          totalSessions,
          totalActiveMembers,
          present,
          absent,
          attendanceRate,
        },
        members,
      };
    } finally {
      client.release();
    }
  }
           
}

import { getDatabasePool } from '../database/database-pool';