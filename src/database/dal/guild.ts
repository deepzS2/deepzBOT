import { Op } from 'sequelize'

import { GetAllGuildsFilters } from '@deepz/types/dal'

import { Guild } from '../connection'
import { GuildInput, GuildOutput } from '../models/Guild'

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

export { getAllGuilds, deleteGuild, getGuildByID, updateGuild, createGuild }
