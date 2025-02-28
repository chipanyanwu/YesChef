export type User = {
  name: string
  email: string
  userId: string

  restrictions?: string[]
  preferences?: string[]
  otherMemories?: string[]

  chatIds?: string[]
}
