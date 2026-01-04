import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import Product from './Product';
import User from './User';

@Table({
  tableName: 'batches',
  timestamps: true,
})
export default class Batch extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  batchNumber!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  product!: string;

  @Column({
    type: DataType.ENUM('milk', 'yogurt', 'cheese', 'butter', 'cream', 'other'),
    allowNull: false,
  })
  productType!: 'milk' | 'yogurt' | 'cheese' | 'butter' | 'cream' | 'other';

  @ForeignKey(() => Product)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  productId?: number;

  @BelongsTo(() => Product)
  productRef?: Product;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  quantity!: number;

  @Column({
    type: DataType.ENUM('L', 'kg', 'units'),
    allowNull: false,
  })
  unit!: 'L' | 'kg' | 'units';

  @Column({
    type: DataType.ENUM('pending', 'in-progress', 'completed', 'failed', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending',
  })
  status!: 'pending' | 'in-progress' | 'completed' | 'failed' | 'cancelled';

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  operatorId!: number;

  @BelongsTo(() => User, 'operatorId')
  operatorRef?: User;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  operator!: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  startTime!: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  endTime?: Date;

  @Column({
    type: DataType.DECIMAL(5, 2),
    allowNull: true,
  })
  temperature?: number;

  @Column({
    type: DataType.DECIMAL(4, 2),
    allowNull: true,
  })
  pH?: number;

  @Column({
    type: DataType.DECIMAL(5, 2),
    allowNull: true,
  })
  yield?: number;

  @Column({
    type: DataType.JSON,
    allowNull: false,
  })
  qualityChecks!: {
    temperature?: string;
    pH?: string;
    bacteria?: string;
  };

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  notes?: string;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  ingredients?: any[];

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  equipment?: any[];

  static initHooks() {
    this.addHook('beforeCreate', (batch: Batch) => {
      if (!batch.batchNumber) {
        const randomSuffix = Math.random().toString(36).substring(2, 15).toUpperCase();
        batch.batchNumber = `BATCH-${Date.now()}-${randomSuffix}`;
      }
      if (!batch.qualityChecks) {
        batch.qualityChecks = {
          temperature: 'pending',
          pH: 'pending',
          bacteria: 'pending'
        };
      }
      if (!batch.ingredients) {
        batch.ingredients = [];
      }
      if (!batch.equipment) {
        batch.equipment = [];
      }
      if (batch.yield === undefined || batch.yield === null) {
        batch.yield = 0;
      }
    });
  }
}
