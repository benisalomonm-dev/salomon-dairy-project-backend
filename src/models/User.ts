import { Table, Column, Model, DataType } from "sequelize-typescript";
import bcrypt from "bcryptjs";
import crypto from "crypto";

@Table({
  tableName: "users",
  timestamps: true,
})
export class User extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id!: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  email!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password!: string;

  @Column({
    type: DataType.ENUM("admin", "manager", "operator", "driver", "viewer"),
    allowNull: false,
    defaultValue: "viewer",
  })
  role!: string;

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
    type: DataType.ENUM("active", "inactive", "suspended"),
    allowNull: false,
    defaultValue: "active",
  })
  status!: string;

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

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  lastLogin?: Date;

  // Instance method to compare password
  async comparePassword(enteredPassword: string): Promise<boolean> {
    return bcrypt.compare(enteredPassword, this.password);
  }

  // Generate password reset token
  getResetPasswordToken(): string {
    const resetToken = crypto.randomBytes(20).toString("hex");

    this.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    this.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    return resetToken;
  }

  // Static method to initialize lifecycle hooks
  static initHooks(): void {
    User.beforeCreate(async (user: User) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    });

    User.beforeUpdate(async (user: User) => {
      if (user.changed("password")) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    });
  }
}

export default User;
