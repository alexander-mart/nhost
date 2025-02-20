import { faker } from '@faker-js/faker'
import { AuthContext, INITIAL_MACHINE_CONTEXT } from '../../../src/machines/context'
import fakeUser from './user'

export const contextWithUser: AuthContext = {
  ...INITIAL_MACHINE_CONTEXT,
  accessToken: {
    value: faker.datatype.string(40),
    expiresAt: faker.date.future()
  },
  refreshToken: {
    value: faker.datatype.uuid()
  },
  user: fakeUser
}

export default contextWithUser
