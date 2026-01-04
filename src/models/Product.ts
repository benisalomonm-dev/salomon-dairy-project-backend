import {
  Table,
  Column,
  Model,
  DataType,
} from 'sequelize-typescript';

@Table({
  tableName: 'products',
  timestamps: true,
})
export default class Product extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name!: string;

  @Column({
    type: DataType.ENUM('Milk', 'Yogurt', 'Cheese', 'Butter', 'Cream', 'Other'),
    allowNull: false,
  })
  category!: 'Milk' | 'Yogurt' | 'Cheese' | 'Butter' | 'Cream' | 'Other';

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  sku!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  barcode?: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description?: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  })
  currentStock!: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  minThreshold!: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  maxCapacity!: number;

  @Column({
    type: DataType.ENUM('L', 'kg', 'units', 'g', 'ml'),
    allowNull: false,
  })
  unit!: 'L' | 'kg' | 'units' | 'g' | 'ml';

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  unitPrice!: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  costPrice!: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  location?: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  shelfLife?: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  storageTemp?: string;

  @Column({
    type: DataType.ENUM('normal', 'low', 'critical', 'out-of-stock'),
    allowNull: false,
    defaultValue: 'normal',
  })
  status!: 'normal' | 'low' | 'critical' | 'out-of-stock';

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  image?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  supplier?: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  lastRestocked?: Date;

  static initHooks() {
    this.addHook('beforeCreate', (instance: Product) => {
      if (instance.currentStock === 0) {
        instance.status = 'out-of-stock';
      } else if (instance.currentStock < instance.minThreshold * 0.5) {
        instance.status = 'critical';
      } else if (instance.currentStock < instance.minThreshold) {
        instance.status = 'low';
      } else {
        instance.status = 'normal';
      }
    });

    this.addHook('beforeUpdate', (instance: Product) => {
      if (instance.currentStock === 0) {
        instance.status = 'out-of-stock';
      } else if (instance.currentStock < instance.minThreshold * 0.5) {
        instance.status = 'critical';
      } else if (instance.currentStock < instance.minThreshold) {
        instance.status = 'low';
      } else {
        instance.status = 'normal';
      }
    });
  }
}
