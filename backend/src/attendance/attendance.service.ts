import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
@Injectable()
export class AttendanceService {
  private async db() {
    return getDatabasePool().connect();
  }

  private isAdmin(actor: any) {
    return actor?.role === 'ADMIN';
  }

  private isLeader(actor: any) {
    return actor?.role === 'LEADER';
  }

  private async getLeaderHomeCells(
    client: any,
    actor: any,
  ) {
    if (!actor?.sub) {
      throw new ForbiddenException(
        'Authenticated user information is unavailable',
      );
    }

    const userResult = await client.query(
      `
      SELECT
        id,
        member_id,
        role
      FROM users
      WHERE id = $1
        AND is_active = TRUE
      `,
      [actor.sub],
    );

    if (userResult.rows.length === 0) {
      throw new ForbiddenException(
        'User account is unavailable',
      );
    }

    const user = userResult.rows[0];

    if (!user.member_id) {
      throw new ForbiddenException(
        'Your user account is not linked to a church member',
      );
    }

    const cellsResult = await client.query(
      `
      SELECT
        id,
        name,
        location,
        meeting_day,
        meeting_time,
        status
      FROM home_cells
      WHERE leader_id = $1
        AND status = 'ACTIVE'
      ORDER BY display_order ASC, created_at ASC
      `,
      [user.member_id],
    );

    if (cellsResult.rows.length === 0) {
      throw new ForbiddenException(
        'You are not assigned as the leader of an active Home Cell',
      );
    }

    return cellsResult.rows;
  }

  private async getAllowedHomeCellIds(
    client: any,
    actor: any,
  ): Promise<string[] | null> {
    if (this.isAdmin(actor)) {
      return null;
    }

    if (!this.isLeader(actor)) {
      throw new ForbiddenException(
        'Attendance management is restricted to administrators and leaders',
      );
    }

    const cells =
      await this.getLeaderHomeCells(client, actor);

    return cells.map((cell: any) => cell.id);
  }

  private async assertSessionAccess(
    client: any,
    sessionId: string,
    actor: any,
  ) {
    const result = await client.query(
      `
      SELECT *
      FROM attendance_sessions
      WHERE id = $1
      `,
      [sessionId],
    );

    if (result.rows.length === 0) {
      throw new BadRequestException(
        'Attendance session not found',
      );
    }

    const session = result.rows[0];

    if (this.isAdmin(actor)) {
      return session;
    }

    const allowedIds =
      await this.getAllowedHomeCellIds(client, actor);

    if (
      !session.home_cell_id ||
      !allowedIds?.includes(session.home_cell_id)
    ) {
      throw new ForbiddenException(
        'You do not have access to this attendance session',
      );
    }

    return session;
  }

  private async assertMemberAccess(
    client: any,
    memberId: string,
    actor: any,
    requiredHomeCellId?: string | null,
  ) {
    const result = await client.query(
      `
      SELECT
        id,
        home_cell_id
      FROM members
      WHERE id = $1
      `,
      [memberId],
    );

    if (result.rows.length === 0) {
      throw new BadRequestException('Member not found');
    }

    const member = result.rows[0];

    if (
      requiredHomeCellId &&
      member.home_cell_id !== requiredHomeCellId
    ) {
      throw new ForbiddenException(
        'This member does not belong to this Home Cell',
      );
    }

    if (this.isAdmin(actor)) {
      return member;
    }

    const allowedIds =
      await this.getAllowedHomeCellIds(client, actor);

    if (
      !member.home_cell_id ||
      !allowedIds?.includes(member.home_cell_id)
    ) {
      throw new ForbiddenException(
        'You do not have access to this member',
      );
    }

    return member;
  }

  async getAttendanceContext(actor: any) {
    const client = await this.db();

    try {
      if (this.isAdmin(actor)) {
        const cellsResult = await client.query(
          `
          SELECT
            h.id,
            h.name,
            h.location,
            h.meeting_day,
            h.meeting_time,
            h.status
          FROM home_cells h
          WHERE h.status = 'ACTIVE'
          ORDER BY
            h.display_order ASC,
            h.created_at ASC
          `,
        );

        const membersResult = await client.query(
          `
          SELECT
            m.id,
            m.membership_number,
            m.first_name,
            m.last_name,
            m.phone,
            m.email,
            m.date_of_birth,
            m.address,
            m.gender,
            m.marital_status,
            m.status,
            m.home_cell_id,
            hc.name AS home_cell_name
          FROM members m
          LEFT JOIN home_cells hc
            ON hc.id = m.home_cell_id
          WHERE m.status = 'ACTIVE'
          ORDER BY
            m.first_name,
            m.last_name
          `,
        );

        return {
          mode: 'ADMIN',
          homeCells: cellsResult.rows,
          members: membersResult.rows,
        };
      }

      if (!this.isLeader(actor)) {
        throw new ForbiddenException(
          'Attendance management is restricted to administrators and leaders',
        );
      }

      const cells =
        await this.getLeaderHomeCells(
          client,
          actor,
        );

      const cellIds =
        cells.map((cell: any) => cell.id);

      const membersResult = await client.query(
        `
        SELECT
          m.id,
          m.membership_number,
          m.first_name,
          m.last_name,
          m.phone,
          m.email,
          m.date_of_birth,
          m.address,
          m.gender,
          m.marital_status,
          m.status,
          m.home_cell_id,
          hc.name AS home_cell_name
        FROM members m
        INNER JOIN home_cells hc
          ON hc.id = m.home_cell_id
        WHERE m.status = 'ACTIVE'
          AND m.home_cell_id = ANY($1::uuid[])
        ORDER BY
          hc.name,
          m.first_name,
          m.last_name
        `,
        [cellIds],
      );

      return {
        mode: 'LEADER',
        homeCells: cells,
        members: membersResult.rows,
      };
    } finally {
      client.release();
    }
  }

  async findAllSessions(actor: any) {
    const client = await this.db();

    try {
      const allowedIds =
        await this.getAllowedHomeCellIds(client, actor);

      const result = await client.query(
        `
        SELECT
          s.*,
          hc.name AS home_cell_name,
          e.id AS event_id,
          e.title AS event_title,
          e.event_type,
          e.status AS event_status,
          COUNT(r.id) FILTER (
            WHERE r.status = 'PRESENT'
          )::int AS attendance_count
        FROM attendance_sessions s
        LEFT JOIN home_cells hc
          ON hc.id = s.home_cell_id
        LEFT JOIN events e
          ON e.attendance_session_id = s.id
        LEFT JOIN attendance_records r
          ON r.session_id = s.id
        WHERE (
          $1::uuid[] IS NULL
          OR s.home_cell_id = ANY($1::uuid[])
        )
        GROUP BY s.id, hc.id, e.id
        ORDER BY s.service_date DESC, s.created_at DESC
        `,
        [allowedIds],
      );

      return result.rows;
    } finally {
      client.release();
    }
  }

  async findSession(id: string, actor: any) {
    const client = await this.db();

    try {
      await this.assertSessionAccess(
        client,
        id,
        actor,
      );

      const sessionResult = await client.query(
        `
        SELECT
          s.*,
          hc.name AS home_cell_name,
          e.id AS event_id,
          e.title AS event_title,
          e.event_type,
          e.status AS event_status
        FROM attendance_sessions s
        LEFT JOIN home_cells hc
          ON hc.id = s.home_cell_id
        LEFT JOIN events e
          ON e.attendance_session_id = s.id
        WHERE s.id = $1
        `,
        [id],
      );

      const recordsResult = await client.query(
        `
        SELECT
          r.*,
          m.membership_number,
          m.first_name,
          m.last_name,
          m.home_cell_id
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

  async createSession(
    data: {
      serviceDate: string;
      serviceType: string;
      notes?: string;
      homeCellId?: string;
    },
    actor: any,
  ) {
    if (!data.serviceDate) {
      throw new BadRequestException(
        'Service date is required',
      );
    }

    if (!data.serviceType?.trim()) {
      throw new BadRequestException(
        'Service type is required',
      );
    }

    const client = await this.db();

    try {
      let homeCellId =
        data.homeCellId || null;

      if (this.isLeader(actor)) {
        const cells =
          await this.getLeaderHomeCells(
            client,
            actor,
          );

        if (cells.length === 1) {
          if (
            homeCellId &&
            homeCellId !== cells[0].id
          ) {
            throw new ForbiddenException(
              'You cannot create attendance for another Home Cell',
            );
          }

          homeCellId = cells[0].id;
        } else {
          if (!homeCellId) {
            throw new BadRequestException(
              'Please select a Home Cell',
            );
          }

          const allowed =
            cells.some(
              (cell: any) =>
                cell.id === homeCellId,
            );

          if (!allowed) {
            throw new ForbiddenException(
              'You cannot create attendance for another Home Cell',
            );
          }
        }
      } else if (!this.isAdmin(actor)) {
        throw new ForbiddenException(
          'Attendance management is restricted to administrators and leaders',
        );
      }

      if (homeCellId && this.isAdmin(actor)) {
        const cellResult =
          await client.query(
            `
            SELECT id
            FROM home_cells
            WHERE id = $1
            `,
            [homeCellId],
          );

        if (cellResult.rows.length === 0) {
          throw new BadRequestException(
            'Home Cell not found',
          );
        }
      }

      const result = await client.query(
        `
        INSERT INTO attendance_sessions (
          service_date,
          service_type,
          home_cell_id,
          notes
        )
        VALUES ($1, $2, $3, $4)
        RETURNING *
        `,
        [
          data.serviceDate,
          data.serviceType.trim(),
          homeCellId,
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
    actor: any,
  ) {
    if (!data.memberId) {
      throw new BadRequestException(
        'Member ID is required',
      );
    }

    const status =
      data.status?.trim().toUpperCase() ||
      'PRESENT';

    if (
      status !== 'PRESENT' &&
      status !== 'ABSENT'
    ) {
      throw new BadRequestException(
        'Attendance status must be PRESENT or ABSENT',
      );
    }

    const client = await this.db();

    try {
      const session =
        await this.assertSessionAccess(
          client,
          sessionId,
          actor,
        );

      await this.assertMemberAccess(
        client,
        data.memberId,
        actor,
        session.home_cell_id,
      );

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
        [
          sessionId,
          data.memberId,
          status,
        ],
      );

      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async removeAttendance(
    sessionId: string,
    memberId: string,
    actor: any,
  ) {
    const client = await this.db();

    try {
      const session =
        await this.assertSessionAccess(
          client,
          sessionId,
          actor,
        );

      await this.assertMemberAccess(
        client,
        memberId,
        actor,
        session.home_cell_id,
      );

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
        throw new BadRequestException(
          'Attendance record not found',
        );
      }

      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async removeSession(
    id: string,
    actor: any,
  ) {
    const client = await this.db();

    try {
      await this.assertSessionAccess(
        client,
        id,
        actor,
      );

      const result = await client.query(
        `
        DELETE FROM attendance_sessions
        WHERE id = $1
        RETURNING *
        `,
        [id],
      );

      if (result.rows.length === 0) {
        throw new BadRequestException(
          'Attendance session not found',
        );
      }

      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async getMemberHistory(
    memberId: string,
    actor: any,
  ) {
    const client = await this.db();

    try {
      const member =
        await this.assertMemberAccess(
          client,
          memberId,
          actor,
        );

      const memberResult = await client.query(
        `
        SELECT
          m.id,
          m.membership_number,
          m.first_name,
          m.last_name,
          m.status,
          m.home_cell_id,
          hc.name AS home_cell_name
        FROM members m
        LEFT JOIN home_cells hc
          ON hc.id = m.home_cell_id
        WHERE m.id = $1
        `,
        [memberId],
      );

      if (memberResult.rows.length === 0) {
        throw new BadRequestException(
          'Member not found',
        );
      }

      let sessionsResult;

      if (this.isAdmin(actor)) {
        sessionsResult = await client.query(
          `
          SELECT
            s.id,
            s.service_date,
            s.service_type,
            s.home_cell_id,
            hc.name AS home_cell_name,
            s.notes,
            COALESCE(
              r.status,
              'NOT_MARKED'
            ) AS attendance_status
          FROM attendance_sessions s
          LEFT JOIN home_cells hc
            ON hc.id = s.home_cell_id
          LEFT JOIN attendance_records r
            ON r.session_id = s.id
           AND r.member_id = $1
          ORDER BY
            s.service_date DESC,
            s.created_at DESC
          `,
          [memberId],
        );
      } else {
        sessionsResult = await client.query(
          `
          SELECT
            s.id,
            s.service_date,
            s.service_type,
            s.home_cell_id,
            hc.name AS home_cell_name,
            s.notes,
            COALESCE(
              r.status,
              'NOT_MARKED'
            ) AS attendance_status
          FROM attendance_sessions s
          LEFT JOIN home_cells hc
            ON hc.id = s.home_cell_id
          LEFT JOIN attendance_records r
            ON r.session_id = s.id
           AND r.member_id = $1
          WHERE s.home_cell_id = $2
          ORDER BY
            s.service_date DESC,
            s.created_at DESC
          `,
          [
            memberId,
            member.home_cell_id,
          ],
        );
      }

      return {
        member: memberResult.rows[0],
        history: sessionsResult.rows,
      };
    } finally {
      client.release();
    }
  }

  async getAttendanceReport(
    from: string | undefined,
    to: string | undefined,
    actor: any,
    requestedHomeCellId?: string,
  ) {
    const client = await this.db();

    try {
      let homeCellId: string | null = null;
      let homeCellName: string | null = null;

      if (this.isAdmin(actor)) {
        if (requestedHomeCellId) {
          const cellResult = await client.query(
            `
            SELECT id, name
            FROM home_cells
            WHERE id = $1
            `,
            [requestedHomeCellId],
          );

          if (cellResult.rows.length === 0) {
            throw new BadRequestException(
              'Home Cell not found',
            );
          }

          homeCellId = cellResult.rows[0].id;
          homeCellName = cellResult.rows[0].name;
        }
      } else if (this.isLeader(actor)) {
        const cells =
          await this.getLeaderHomeCells(
            client,
            actor,
          );

        if (requestedHomeCellId) {
          const selectedCell =
            cells.find(
              (cell: any) =>
                cell.id === requestedHomeCellId,
            );

          if (!selectedCell) {
            throw new ForbiddenException(
              'You do not have access to this Home Cell',
            );
          }

          homeCellId = selectedCell.id;
          homeCellName = selectedCell.name;
        } else if (cells.length === 1) {
          homeCellId = cells[0].id;
          homeCellName = cells[0].name;
        } else {
          throw new BadRequestException(
            'Please select a Home Cell',
          );
        }
      } else {
        throw new ForbiddenException(
          'Attendance reports are restricted to administrators and leaders',
        );
      }

      const params = [
        from?.trim() || null,
        to?.trim() || null,
        homeCellId,
      ];

      /*
       * $3 NULL means the ADMIN church-wide report.
       * Church-wide reports intentionally include only
       * sessions where home_cell_id IS NULL.
       *
       * $3 UUID means a specific Home Cell report.
       */
      const sessionScope = `
        (
          ($3::uuid IS NULL AND home_cell_id IS NULL)
          OR
          ($3::uuid IS NOT NULL AND home_cell_id = $3::uuid)
        )
      `;

      const sessionsResult = await client.query(
        `
        SELECT
          COUNT(*)::int AS total_sessions
        FROM attendance_sessions
        WHERE
          ($1::date IS NULL OR service_date >= $1::date)
          AND
          ($2::date IS NULL OR service_date <= $2::date)
          AND
          ${sessionScope}
        `,
        params,
      );

      const membersResult = await client.query(
        `
        SELECT
          COUNT(*)::int AS total_active_members
        FROM members
        WHERE status = 'ACTIVE'
          AND (
            $1::uuid IS NULL
            OR home_cell_id = $1::uuid
          )
        `,
        [homeCellId],
      );

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
        INNER JOIN members m
          ON m.id = r.member_id
        WHERE
          ($1::date IS NULL OR s.service_date >= $1::date)
          AND
          ($2::date IS NULL OR s.service_date <= $2::date)
          AND (
            ($3::uuid IS NULL AND s.home_cell_id IS NULL)
            OR
            ($3::uuid IS NOT NULL AND s.home_cell_id = $3::uuid)
          )
          AND (
            $3::uuid IS NULL
            OR m.home_cell_id = $3::uuid
          )
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
          m.home_cell_id,
          hc.name AS home_cell_name,
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
        LEFT JOIN home_cells hc
          ON hc.id = m.home_cell_id
        LEFT JOIN attendance_sessions s
          ON (
            ($1::date IS NULL OR s.service_date >= $1::date)
            AND
            ($2::date IS NULL OR s.service_date <= $2::date)
            AND (
              ($3::uuid IS NULL AND s.home_cell_id IS NULL)
              OR
              ($3::uuid IS NOT NULL AND s.home_cell_id = $3::uuid)
            )
          )
        LEFT JOIN attendance_records r
          ON r.session_id = s.id
          AND r.member_id = m.id
        WHERE m.status = 'ACTIVE'
          AND (
            $3::uuid IS NULL
            OR m.home_cell_id = $3::uuid
          )
        GROUP BY
          m.id,
          m.membership_number,
          m.first_name,
          m.last_name,
          m.home_cell_id,
          hc.name
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

      const members =
        memberStatsResult.rows.map(
          (member: any) => ({
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
        scope: {
          type: homeCellId
            ? 'HOME_CELL'
            : 'CHURCH',
          homeCellId,
          homeCellName,
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