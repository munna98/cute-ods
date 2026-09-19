import { cookies } from 'next/headers'
import { prisma } from './prisma'
import { DEMO_USERS, Role, UserSession } from './auth-constants'

export * from './auth-constants'

export async function getCurrentUser(): Promise<UserSession> {
  const cookieStore = await cookies()
  const userId = cookieStore.get('ods_user_id')?.value

  if (userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      })
      if (user) return { id: user.id, name: user.name, role: user.role as Role }
    } catch {
      const demo = DEMO_USERS.find(u => u.id === userId)
      if (demo) return demo
    }
  }

  const demo = DEMO_USERS.find(u => u.id === userId) || DEMO_USERS[0]
  return demo
}
