import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
} from 'sequelize-typescript';
import bcrypt from 'bcryptjs';
import Order from '../models/Order';
import Batch from '../models/Batch';
import Invoice from '../models/Invoice';

@Table({
  tableName: 'users',
  timestamps: true,
})
export default class User extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: {
        msg: 'Please enter a valid email',
      },
    },
  })
  email!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password!: string;

  @Column({
    type: DataType.ENUM('admin', 'manager', 'operator', 'driver', 'viewer'),
    allowNull: false,
    defaultValue: 'viewer',
  })
  role!: 'admin' | 'manager' | 'operator' | 'driver' | 'viewer';

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  phone?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  avatar?: string;

  @Column({
    type: DataType.ENUM('active', 'inactive'),
    allowNull: false,
    defaultValue: 'active',
  })
  status!: 'active' | 'inactive';

  @Column({
    type: DataType.JSON,
    allowNull: false,
    defaultValue: [],
  })
  permissions!: string[];

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  lastLogin?: Date;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  resetPasswordToken?: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  resetPasswordExpire?: Date;

  // Relationships
  @HasMany(() => Order, 'createdBy')
  ordersCreated!: Order[];

  @HasMany(() => Order, 'driverId')
  ordersDelivered!: Order[];

  @HasMany(() => Batch, 'operatorId')
  batches!: Batch[];

  @HasMany(() => Invoice, 'createdBy')
  invoices!: Invoice[];

  // Method to compare password
  async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }

  // Initialize hooks
  static initHooks() {
    this.addHook('beforeCreate', async (instance: User) => {
      if (instance.password) {
        const salt = await bcrypt.genSalt(10);
        instance.password = await bcrypt.hash(instance.password, salt);
      }
    });

    this.addHook('beforeUpdate', async (instance: User) => {
      if (instance.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        instance.password = await bcrypt.hash(instance.password, salt);
      }
    });
  }
}
