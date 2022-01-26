import { Op } from 'sequelize'

import { Guild } from '@database/connection'
import { GuildInput, GuildOutput } from '@database/models/Guild'
import { GetAllGuildsFilters } from '@myTypes'

const createGuild = async (payload: GuildInput): Promise<GuildOutput> => {
  const guild = await Guild.create(payload)

  return guild
}

const updateGuild = async (
  id: string,
  payload: Partial<GuildInput>
): Promise<GuildOutput> => {
  const guild = await Guild.findByPk(id)

  if (!guild) {
    throw new Error('Guild not found with that ID')
  }

  const updatedGuild = await guild.update(payload)
  return updatedGuild
}

const getGuildByID = async (id: string): Promise<GuildOutput> => {
  const guild = await Guild.findByPk(id)

  if (!guild) {
    throw new Error('Guild not found with that ID')
  }

  return guild
}

const deleteGuild = async (id: string): Promise<boolean> => {
  const deletedGuildCount = await Guild.destroy({
    where: { id },
  })

  return !!deletedGuildCount
}

const getAllGuilds = async (
  filters?: GetAllGuildsFilters
): Promise<GuildOutput[]> => {
  return Guild.findAll({
    where: {
      ...(filters?.isDeleted && { deletedAt: { [Op.not]: null } }),
    },
    ...((filters?.isDeleted || filters?.includedDeleted) && { paranoid: true }),
  })
}

export default {
  getAllGuilds,
  deleteGuild,
  getGuildByID,
  updateGuild,
  createGuild,
}
