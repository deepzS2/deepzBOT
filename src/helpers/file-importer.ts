import glob from 'glob'
import { promisify } from 'util'

const globPromise = promisify(glob)

/**
 * It imports a file and returns the default export
 * @param {string} filePath - The path to the file you want to import.
 * @returns The default export of the imported file.
 */
export async function importFile<T>(filePath: string): Promise<T> {
  const imported = await import(filePath)

  return imported.default as T
}

/**
 * Read directory for globPath pattern and return an async generator
 * @param globPath Path patterns for the files
 * @returns Async generator with imported files
 * @example
 * const generator = await importFiles<string, number>('src\/commands\/*\/*.{ts,js}')
 * const result = generator.next()
 * generator.next(0)
 */
export async function* importFiles<T, TReturn>(
  globPath: string
): AsyncGenerator<T, TReturn[], TReturn> {
  const filesPaths = await globPromise(globPath)
  const returnArray: TReturn[] = []

  for (let i = 0; i < filesPaths.length; i++) {
    const imported = await importFile<T>(filesPaths[i])

    const result = yield imported

    returnArray.push(result)
  }

  return returnArray
}
