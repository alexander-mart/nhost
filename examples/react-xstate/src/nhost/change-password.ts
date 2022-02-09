import { AxiosInstance } from 'axios'
import { createMachine, sendParent } from 'xstate'
import { ErrorEvent } from './backend-services'
import { isValidPassword } from './validators'

type Context = {}
const initialContext: Context = {}

export const createChangePasswordMachine = (api: AxiosInstance) =>
  createMachine(
    {
      id: 'remote',
      initial: 'idle',
      context: initialContext,
      states: {
        idle: {
          on: {
            REQUEST_CHANGE: [
              {
                cond: 'invalidPassword',
                actions: 'sendInvalid'
              },
              {
                target: 'requesting'
              }
            ]
          }
        },
        requesting: {
          entry: 'sendLoading',
          invoke: {
            src: 'requestChange',
            id: 'requestChange',
            onDone: [
              {
                target: 'idle',
                actions: 'sendSuccess'
              }
            ],
            onError: [
              {
                actions: 'sendError',
                target: 'idle'
              }
            ]
          }
        }
      }
    },
    {
      actions: {
        sendLoading: sendParent('CHANGE_PASSWORD_LOADING'),
        sendInvalid: sendParent('CHANGE_PASSWORD_INVALID'),
        sendSuccess: sendParent('CHANGE_PASSWORD_SUCCESS'),
        sendError: sendParent<Context, any, ErrorEvent>((_, { data: { error } }) => ({
          type: 'CHANGE_PASSWORD_ERROR',
          error
        }))
      },
      guards: {
        invalidPassword: (_, { password }) => !isValidPassword(password)
      },
      services: {
        requestChange: async (_, { password, accessToken }) =>
          await api.post(
            '/v1/auth/user/password',
            { newPassword: password },
            {
              headers: {
                authorization: `Bearer ${accessToken}`
              }
            }
          )
      }
    }
  )
export type ChangePasswordMachine = typeof createChangePasswordMachine
