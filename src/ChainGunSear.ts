import { unpackGraph } from '@notabug/gun-sear'
import { ChainGun, ChainGunLink } from '@notabug/chaingun'
import { ChainGunUserApi } from './ChainGunUserApi'

export class ChainGunSear extends ChainGun {
  _user?: ChainGunUserApi

  constructor(graph: any, LinkClass = ChainGunLink) {
    super(graph, LinkClass)
    this.registerSearMiddleware()
  }

  registerSearMiddleware() {
    this.graph.use(unpackGraph)
  }

  user() {
    return (this._user = this._user || new ChainGunUserApi(this))
  }
}
