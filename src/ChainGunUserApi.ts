import { ChainGunSear } from './ChainGunSear'
import { createUser, authenticate, graphSigner } from '@notabug/gun-sear'

interface UserReference {
  alias: string
  pub: string
}

interface AckErr {
  err: Error
}

interface UserCredentials {
  priv: string
  epriv: any
  alias: string
  pub: string
  epub: string
}

type LoginCallback = (userRef: UserReference | AckErr) => void

const DEFAULT_CREATE_OPTS = {}
const DEFAULT_AUTH_OPTS = {}

export class ChainGunUserApi {
  is?: UserReference
  private _gun: ChainGunSear
  private _signMiddleware?: (graph: any) => Promise<any>

  constructor(gun: ChainGunSear) {
    this._gun = gun
  }

  /**
   *
   * https://gun.eco/docs/User#user-create
   *
   * @param alias
   * @param password
   * @param cb
   * @param opt
   */
  async create(alias: string, password: string, cb?: LoginCallback, opt = DEFAULT_CREATE_OPTS) {
    try {
      const user = await createUser(this._gun, alias, password)
      const ref = this.useCredentials(user)
      if (cb) cb(ref)
      return ref
    } catch (err) {
      if (cb) cb({ err })
      throw err
    }
  }

  /**
   *
   * https://gun.eco/docs/User#user-auth
   *
   * @param alias
   * @param password
   * @param cb
   * @param opt
   */
  async auth(alias: string, password: string, cb?: LoginCallback, opt = DEFAULT_AUTH_OPTS) {
    try {
      const user = await authenticate(this._gun, alias, password)
      const ref = this.useCredentials(user)
      if (cb) cb(ref)
      return ref
    } catch (err) {
      if (cb) cb({ err })
      throw err
    }
  }

  /**
   * https://gun.eco/docs/User#user-leave
   */
  leave() {
    if (this._signMiddleware) {
      this._gun.graph.unuse(this._signMiddleware, 'write')
      this._signMiddleware = undefined
      this.is = undefined
    }
  }

  useCredentials(credentials: UserCredentials) {
    this.leave()
    this._signMiddleware = graphSigner({
      pub: credentials.pub,
      priv: credentials.priv
    })
    this._gun.graph.use(this._signMiddleware, 'write')
    return (this.is = {
      alias: credentials.alias,
      pub: credentials.pub
    })
  }
}
