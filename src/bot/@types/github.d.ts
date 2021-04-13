export type Commit = {
  author: Record<string, string>
  committer: Record<string, string>
  message: string
}

export interface Commits {
  commit: Commit
}
