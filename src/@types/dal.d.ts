interface GlobalFilters {
  isDeleted?: boolean
  includedDeleted?: boolean
}

export type GetAllUsersFilters = GlobalFilters

export type GetAllGuildsFilters = GlobalFilters
