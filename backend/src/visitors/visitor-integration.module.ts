import { BadRequestException, Body, Controller, Get, Injectable, Module, Param, ParseUUIDPipe, Patch, UseGuards } from '@nestjs/common';
import { IsBoolean, IsDateString, IsIn, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { getDatabasePool } from '../database/database-pool';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AuthModule } from '../auth/auth.module';
class IntegrationDto {
  @IsIn(['NEW','FOLLOW_UP','CONNECTED','DISCIPLESHIP','MEMBERSHIP']) stage!: string;
  @IsOptional() @IsUUID() homeCellId?: string;
  @IsBoolean() discipleshipStarted!: boolean;
  @IsBoolean() discipleshipCompleted!: boolean;
  @IsOptional() @IsDateString() nextFollowUpDate?: string;
  @IsOptional() @IsString() @MaxLength(3000) integrationNotes?: string;
}
@Injectable()
class IntegrationService {
  private async setup(client:any) {
    await client.query(`CREATE TABLE IF NOT EXISTS visitor_integration (
      visitor_id UUID PRIMARY KEY REFERENCES visitors(id) ON DELETE CASCADE,
      stage VARCHAR(30) NOT NULL DEFAULT 'NEW' CHECK (stage IN ('NEW','FOLLOW_UP','CONNECTED','DISCIPLESHIP','MEMBERSHIP')),
      home_cell_id UUID REFERENCES home_cells(id) ON DELETE SET NULL,
      discipleship_started BOOLEAN NOT NULL DEFAULT FALSE,
      discipleship_completed BOOLEAN NOT NULL DEFAULT FALSE,
      next_follow_up_date DATE, integration_notes TEXT NOT NULL DEFAULT '',
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`);
  }
  async list(){
    const client=await getDatabasePool().connect();
    try {
      await this.setup(client);
      const visitors=await client.query(`SELECT v.id AS visitor_id,v.first_name,v.last_name,v.status,
        CASE WHEN v.status='CONVERTED' THEN 'MEMBERSHIP' ELSE COALESCE(i.stage,'NEW') END AS stage,
        i.home_cell_id,h.name AS home_cell_name,
        COALESCE(i.discipleship_started,false) AS discipleship_started,
        COALESCE(i.discipleship_completed,false) AS discipleship_completed,
        i.next_follow_up_date,COALESCE(i.integration_notes,'') AS integration_notes
        FROM visitors v LEFT JOIN visitor_integration i ON i.visitor_id=v.id
        LEFT JOIN home_cells h ON h.id=i.home_cell_id
        WHERE v.status<>'ARCHIVED' ORDER BY v.created_at DESC`);
      const cells = await client.query("SELECT id,name FROM home_cells ORDER BY name");
      return {visitors:visitors.rows,homeCells:cells.rows};
    } finally {client.release();}
  }
  async update(id:string,dto:IntegrationDto){
    const client=await getDatabasePool().connect();
    try {
      await this.setup(client);
      const result=await client.query('SELECT status FROM visitors WHERE id=$1',[id]);
      if(!result.rows.length) throw new BadRequestException('Visitor not found');
      const status=result.rows[0].status;
      if(status==='ARCHIVED') throw new BadRequestException('Visitor archived');
      if(status==='CONVERTED'&&dto.stage!=='MEMBERSHIP') throw new BadRequestException('Converted visitor must remain in Membership stage');
      if(status!=='CONVERTED'&&dto.stage==='MEMBERSHIP') throw new BadRequestException('Use Convert to Member first');
      if(dto.discipleshipCompleted&&!dto.discipleshipStarted) throw new BadRequestException('Start discipleship before completing it');
      const saved=await client.query(`INSERT INTO visitor_integration
        (visitor_id,stage,home_cell_id,discipleship_started,discipleship_completed,next_follow_up_date,integration_notes)
        VALUES ($1,$2,$3,$4,$5,$6::date,$7)
        ON CONFLICT(visitor_id) DO UPDATE SET stage=EXCLUDED.stage,home_cell_id=EXCLUDED.home_cell_id,
        discipleship_started=EXCLUDED.discipleship_started,discipleship_completed=EXCLUDED.discipleship_completed,
        next_follow_up_date=EXCLUDED.next_follow_up_date,integration_notes=EXCLUDED.integration_notes,updated_at=NOW()
        RETURNING *`,[id,dto.stage,dto.homeCellId||null,dto.discipleshipStarted,dto.discipleshipCompleted,dto.nextFollowUpDate||null,dto.integrationNotes||'']);
      return saved.rows[0];
    } finally {client.release();}
  }
}
@Controller('visitor-integration')
@UseGuards(JwtAuthGuard,RolesGuard)
class IntegrationController {
  constructor(private readonly service:IntegrationService){}
  @Roles('ADMIN','LEADER') @Get() list(){return this.service.list();}
  @Roles('ADMIN','LEADER') @Patch(':id') update(@Param('id',ParseUUIDPipe) id:string,@Body() body:IntegrationDto){return this.service.update(id,body);}
}
@Module({imports:[AuthModule],controllers:[IntegrationController],providers:[IntegrationService]})
export class VisitorIntegrationModule {}
