// utils/auth.ts
import { cookies } from 'next/headers'

export async function  isAuthenticated() {
  const authToken = (await (cookies())).get('authToken')?.value
  return !!authToken // Returns true if authToken exists
}