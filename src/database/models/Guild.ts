import { DataTypes, Model, Sequelize } from 'sequelize'

interface Role {
  role: string
  emoji: string
}

interface GuildAttributes {
  id: string
  name: string
  twitchs?: string
  twitchsVirtual?: string[]
  couple?: string
  notificationChannel?: string
  roleMessage?: string
  channelRoleMessage?: number
  roles?: string
  rolesVirtual?: Role[]
  createdAt?: Date
  updatedAt?: Date
  deletedAt?: Date
}

export type GuildInput = Omit<GuildAttributes, 'roles' | 'twitchs'>
export type GuildOutput = Required<GuildAttributes>

export class GuildModel
  extends Model<GuildAttributes, GuildInput>
  implements GuildAttributes
{
  public id!: string
  public name!: string
  public readonly twitchs!: string
  public twitchsVirtual!: string[]
  public couple!: string
  public notificationChannel!: string
  public roleMessage!: string
  public channelRoleMessage!: number
  public readonly roles!: string
  public rolesVirtual!: Role[]
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
  public readonly deletedAt!: Date
}

export default function (sequelize: Sequelize) {
  return GuildModel.init(
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      couple: {
        type: DataTypes.STRING,
      },
      twitchs: {
        type: DataTypes.TEXT,
      },
      twitchsVirtual: {
        type: DataTypes.VIRTUAL,
        set: function (value) {
          this.setDataValue('twitchs', (value as string[]).join(','))
        },
        get: function () {
          const rawValue = this.getDataValue('twitchs')

          return rawValue.split(',')
        },
      },
      notificationChannel: {
        type: DataTypes.STRING,
      },
      roleMessage: {
        type: DataTypes.TEXT,
      },
      channelRoleMessage: {
        type: DataTypes.STRING,
      },
      roles: {
        type: DataTypes.TEXT,
      },
      rolesVirtual: {
        type: DataTypes.VIRTUAL,
        set: function (value) {
          const roles = (value as Role[]).map(
            (role) => `${role.role}/${role.emoji}`
          )

          this.setDataValue('roles', roles.join(','))
        },
        get: function (): Role[] {
          const roles = this.getDataValue('roles').split(',')

          return roles.map((role) => {
            const [name, emoji] = role.split('/')

            return {
              role: name,
              emoji,
            }
          })
        },
      },
    },
    {
      timestamps: true,
      sequelize: sequelize,
      paranoid: true,
      modelName: 'guilds',
    }
  )
}
