import { DataTypes, Model, Optional, NOW, Sequelize } from 'sequelize'

interface UserAttributes {
  id: string
  username: string
  bio: string
  couple?: string
  backgroundImage?: string
  osu?: string
  reputation?: number
  balance?: number
  xp?: number
  daily?: Date
  dailyRep?: Date
  createdAt?: Date
  updatedAt?: Date
  deletedAt?: Date
}

export type UserInput = Optional<UserAttributes, 'bio'>
export type UserOutput = Required<UserAttributes>

export class UserModel
  extends Model<UserAttributes, UserInput>
  implements UserAttributes
{
  public id!: string
  public username!: string
  public bio!: string
  public couple!: string
  public backgroundImage!: string
  public osu!: string
  public reputation!: number
  public balance!: number
  public xp!: number
  public daily!: Date
  public dailyRep!: Date
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
  public readonly deletedAt!: Date
}

export default function (sequelize: Sequelize) {
  return UserModel.init(
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      bio: {
        type: DataTypes.STRING,
      },
      couple: {
        type: DataTypes.STRING,
      },
      backgroundImage: {
        type: DataTypes.STRING,
      },
      osu: {
        type: DataTypes.STRING,
      },
      reputation: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      balance: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },
      xp: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },
      daily: {
        type: DataTypes.DATE,
        defaultValue: NOW,
      },
      dailyRep: {
        type: DataTypes.DATE,
        defaultValue: NOW,
      },
    },
    {
      timestamps: true,
      sequelize,
      paranoid: true,
      modelName: 'users',
    }
  )
}
