import {
  BadRequestException, Body, Controller, ForbiddenException,
  Get, Injectable, Module, Param, ParseUUIDPipe,
  Post, Req, UseGuards,
} from '@nestjs/common';
import {
  IsIn, IsNumber, IsOptional, IsString, MaxLength, Min,
} from 'class-validator';
import { getDatabasePool } from '../database/database-pool';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { AuthModule } from '../auth/auth.module';

class CreateAssetDto {
  @IsString() @MaxLength(150)
  name!: string;

  @IsString() @MaxLength(100)
  category!: string;

  @IsString() @MaxLength(100)
  assetNumber!: string;

  @IsOptional() @IsString() @MaxLength(100)
  purchaseDate?: string;

  @IsNumber() @Min(0)
  purchaseCost!: number;

  @IsNumber() @Min(0)
  estimatedValue!: number;

  @IsIn(['GOOD', 'NEEDS_REPAIR', 'DAMAGED'])
  condition!: string;

  @IsString() @MaxLength(150)
  custodian!: string;

  @IsOptional() @IsString() @MaxLength(1000)
  notes?: string;
}

class AddMaintenanceDto {
  @IsString() @MaxLength(1000)
  description!: string;

  @IsString() @MaxLength(30)
  maintenanceDate!: string;

  @IsNumber() @Min(0)
  cost!: number;

  @IsOptional() @IsString() @MaxLength(150)
  performedBy?: string;
}

@Injectable()
class ChurchAssetsService {
  private async setup(client: any) {
    await client.query(`
      CREATE TABLE IF NOT EXISTS church_assets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(150) NOT NULL,
        category VARCHAR(100) NOT NULL,
        asset_number VARCHAR(100) NOT NULL UNIQUE,
        purchase_date DATE,
        purchase_cost NUMERIC(14,2) NOT NULL DEFAULT 0,
        estimated_value NUMERIC(14,2) NOT NULL DEFAULT 0,
        condition VARCHAR(30) NOT NULL DEFAULT 'GOOD'
          CHECK (condition IN ('GOOD','NEEDS_REPAIR','DAMAGED')),
        custodian VARCHAR(150) NOT NULL DEFAULT '',
        notes TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS church_asset_maintenance (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        asset_id UUID NOT NULL
          REFERENCES church_assets(id) ON DELETE CASCADE,
        description TEXT NOT NULL,
        maintenance_date DATE NOT NULL,
        cost NUMERIC(14,2) NOT NULL DEFAULT 0,
        performed_by VARCHAR(150) NOT NULL DEFAULT '',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
  }

  private check(user: any, admin = false) {
    if (
      admin ? user?.role !== 'ADMIN'
        : !['ADMIN', 'LEADER'].includes(user?.role)
    ) {
      throw new ForbiddenException('Insufficient permissions');
    }
  }

  async list(user: any) {
    this.check(user);
    const client = await getDatabasePool().connect();
    try {
      await this.setup(client);
      const [assets, maintenance] = await Promise.all([
        client.query(
          'SELECT * FROM church_assets ORDER BY created_at DESC'
        ),
        client.query(`
          SELECT * FROM church_asset_maintenance
          ORDER BY maintenance_date DESC, created_at DESC
        `),
      ]);
      return {
        assets: assets.rows,
        maintenance: maintenance.rows,
      };
    } finally {
      client.release();
    }
  }

  async create(user: any, dto: CreateAssetDto) {
    this.check(user, true);
    if (!dto.name.trim() || !dto.assetNumber.trim()) {
      throw new BadRequestException(
        'Asset name and asset number are required'
      );
    }
    const client = await getDatabasePool().connect();
    try {
      await this.setup(client);
      const result = await client.query(`
        INSERT INTO church_assets (
          name, category, asset_number, purchase_date,
          purchase_cost, estimated_value, condition,
          custodian, notes
        )
        VALUES (
          $1,$2,$3,$4::date,$5,$6,$7,$8,$9
        )
        RETURNING *
      `, [
        dto.name.trim(), dto.category.trim(),
        dto.assetNumber.trim(), dto.purchaseDate || null,
        dto.purchaseCost, dto.estimatedValue,
        dto.condition, dto.custodian.trim(),
        dto.notes || '',
      ]);
      return result.rows[0];
    } catch (error: any) {
      if (error?.code === '23505') {
        throw new BadRequestException(
          'This asset number already exists'
        );
      }
      throw error;
    } finally {
      client.release();
    }
  }

  async maintain(
    user: any, assetId: string, dto: AddMaintenanceDto
  ) {
    this.check(user, true);
    const client = await getDatabasePool().connect();
    try {
      await this.setup(client);
      const result = await client.query(`
        INSERT INTO church_asset_maintenance (
          asset_id, description, maintenance_date,
          cost, performed_by
        )
        SELECT id,$2,$3::date,$4,$5
        FROM church_assets WHERE id=$1
        RETURNING *
      `, [
        assetId, dto.description, dto.maintenanceDate,
        dto.cost, dto.performedBy || '',
      ]);
      if (!result.rows.length) {
        throw new BadRequestException('Asset not found');
      }
      return result.rows[0];
    } finally {
      client.release();
    }
  }
}

@Controller('church-assets')
@UseGuards(JwtAuthGuard, RolesGuard)
class ChurchAssetsController {
  constructor(private readonly service: ChurchAssetsService) {}

  @Get()
  list(@Req() req: any) {
    return this.service.list(req.user);
  }

  @Post()
  create(@Req() req: any, @Body() dto: CreateAssetDto) {
    return this.service.create(req.user, dto);
  }

  @Post(':id/maintenance')
  maintain(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddMaintenanceDto
  ) {
    return this.service.maintain(req.user, id, dto);
  }
}

@Module({
  imports: [AuthModule],
  controllers: [ChurchAssetsController],
  providers: [ChurchAssetsService],
})
export class ChurchAssetsModule {}
