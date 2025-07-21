declare module 'node-mbus' {
  export interface MBusMasterOptions {
    host: string,
    port: number,
    timeout?: number,
    autoConnect?: boolean
  }

  class MBusMaster {
    constructor(config: MBusMasterOptions)
    connect(clb: (err: Error) => void): void
    getData(primaryAddress: number, clb: (err: Error, data: any) => void): void
    close(clb: (err: Error) => void): void
  }

  export default MBusMaster
}