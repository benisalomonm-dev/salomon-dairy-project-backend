import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
  Index,
} from 'sequelize-typescript';
import Order from './Order';
import Invoice from './Invoice';

@Table({
  tableName: 'clients',
  timestamps: true,
  indexes: [
    {
      type: 'FULLTEXT',
      fields: ['name', 'email']
    }
  ]
})
export default class Client extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  @Index
  name!: string;

  @Column({
    type: DataType.ENUM('Restaurant', 'Grocery', 'Hotel', 'Cafe', 'Retail', 'Wholesaler', 'Other'),
    allowNull: false,
  })
  type!: 'Restaurant' | 'Grocery' | 'Hotel' | 'Cafe' | 'Retail' | 'Wholesaler' | 'Other';

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      isEmail: {
        msg: 'Please enter a valid email',
      },
    },
  })
  @Index
  email!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  phone!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  address!: string;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  contact?: {
    name: string;
    position?: string;
    email?: string;
    phone?: string;
  };

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  billingAddress?: {
    street: string;
    city: string;
    zipCode: string;
    country: string;
  };

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  deliveryAddress?: {
    street: string;
    city: string;
    zipCode: string;
    country: string;
  };

  @Column({
    type: DataType.ENUM('active', 'inactive', 'suspended'),
    allowNull: false,
    defaultValue: 'active',
  })
  status!: 'active' | 'inactive' | 'suspended';

  @Column({
    type: DataType.DECIMAL(2, 1),
    allowNull: true,
    validate: {
      min: 0,
      max: 5,
    },
  })
  rating?: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
    },
  })
  totalOrders!: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
    },
  })
  totalRevenue!: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
    },
  })
  monthlyRevenue!: number;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  preferences?: {
    deliveryDays?: string[];
    paymentTerms?: number;
    deliveryTime?: string;
  };

  @Column({
    type: DataType.JSON,
    allowNull: false,
    defaultValue: [],
  })
  favoriteProducts!: string[];

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  lastOrderDate?: Date;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  notes?: string;

  @HasMany(() => Order)
  orders!: Order[];

  @HasMany(() => Invoice)
  invoices!: Invoice[];
}
