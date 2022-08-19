const MAX_EXPERIENCE = 433

/**
 * It takes the experience of a user and returns the level, the experience needed to level
 * up and the actual experience
 * @param {number} experience - number - The experience of the user
 * @returns An object with the level, experienceToLevelUp, and actualExperience
 */
export const getExperienceInformation = (experience: number) => {
  let level = 1
  let experienceToLevelUp = MAX_EXPERIENCE
  let actualExperience = experience

  // Gets the level of the player
  // TODO: Store those data in database
  while (actualExperience >= experienceToLevelUp) {
    experienceToLevelUp = level * MAX_EXPERIENCE
    actualExperience -= level * MAX_EXPERIENCE
    level++
  }

  return {
    level,
    experienceToLevelUp,
    actualExperience,
  }
}
