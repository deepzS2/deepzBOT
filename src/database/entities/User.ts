import {
  Entity,
  Column,
  PrimaryColumn,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm'

@Entity()
export class User {
  @PrimaryColumn()
  id: string

  @Column({ nullable: false })
  username: string

  @Column()
  bio: string

  @Column()
  couple: string

  @Column()
  background_image: string

  @Column()
  osu: string

  @Column({ type: 'int', default: 0 })
  reputation: number

  @Column({ type: 'float', default: 0 })
  balance: number

  @Column({ type: 'float', default: 0 })
  xp: number

  @Column('timestamp')
  daily: Date

  @Column('timestamp')
  daily_rep

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
