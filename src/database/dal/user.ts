import { Op } from 'sequelize'
import { GetAllUsersFilters } from '../../@types/dal'
import { User } from '..' 
import { UserInput, UserOutput } from '../models/User'

export const createUser = async (payload: UserInput): Promise<UserOutput> => {
  const user = await User.create(payload)
  return user
}

export const updateUser = async (id: string, payload: Partial<UserInput>): Promise<UserOutput> => {
  const user = await User.findByPk(id)

  if (!user) {
    throw new Error('User not found with that ID')
  }

  const updatedUser = await user.update(payload)
  return updatedUser
}

export const getUserByID = async (id: string): Promise<UserOutput> => {
  const user =  await User.findByPk(id)

  if (!user) {
    throw new Error('User not found with that ID')
  }

  return user
}

export const deleteUser = async (id: string): Promise<boolean> => {
  const deletedUserCount = await User.destroy({
    where: { id }
  })

  return !!deletedUserCount
}

export const getAllUsers = async (filters?: GetAllUsersFilters): Promise<UserOutput[]> => {
  return User.findAll({
    where: {
      ...(filters?.isDeleted && { deletedAt: {[Op.not]: null}})
    },
    ...((filters?.isDeleted || filters?.includedDeleted) && { paranoid: true })
  })
}