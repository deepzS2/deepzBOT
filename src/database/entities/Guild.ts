import {
  Entity,
  Column,
  PrimaryColumn,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm'

@Entity()
export class Guild {
  @PrimaryColumn()
  id: string

  @Column({ nullable: false })
  name: string

  @Column({ type: 'text', array: true })
  twitchs: string[]

  @Column()
  notification_channel: string

  @Column()
  couple: string

  @Column()
  role_message: string

  @Column()
  channel_role_message: string

  @Column({
    type: 'jsonb',
    array: false,
    default: () => "'[]'",
    nullable: false,
  })
  roles: Array<{ role: string; emoji: string }>

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  public created_at: Date

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  public updated_at: Date
}
