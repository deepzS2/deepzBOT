interface GlobalFilters {
  isDeleted?: boolean
  includedDeleted?: boolean
}

export interface GetAllUsersFilters extends GlobalFilters {}

export interface GetAllGuildsFilters extends GlobalFilters {}