import * as MbusMasterDef from "node-mbus"
const MbusMaster = MbusMasterDef.default

enum State {
  Disconnected = 'disconnected',
  Connecting = 'connecting',
  Connected = 'connected',
  Disconnecting = 'disconnecting'
}

export type ReadSlaveRecordQuery = {
  recordId: number,
  rescaleOrder?: number
}

export type ReadSlaveQuery = {
  primaryAddress: number, 
  serial: number,
  records: ReadSlaveRecordQuery[]
}

export type ReadSlaveRecordData = {
  recordId: number,
  function?: string,
  unit?: string,
  value?: number,
  originalValue?: number
  timestamp?: Date,
  error?: Error
}

export type ReadSlaveResponse = {
  query: ReadSlaveQuery,
  data: ReadSlaveRecordData[],
  error?: Error
}

export class MbusReadout {

  private _config
  private _mbusMaster: typeof MbusMaster
  private _state: State = State.Disconnected

  public get state(): State { return this._state }

  constructor(config) {
    this._config = config
    this._mbusMaster = new MbusMaster(config)
  }

  public async connect() {
    if (this.state === State.Connected) {
      return
    }
    if (this.state !== State.Disconnected) {
      throw new Error(`[Readout] Can't connect in state ${this.state}`)
    }
    return new Promise<void>((resolve, reject) => {
      this._state = State.Connecting
      this._mbusMaster.connect((err) => {
        if (err) {
          this._state = State.Disconnected
          reject(err)
          return
        }
        this._state = State.Connected
        resolve()
      })
    })
  }

  public async close() {
    if (this.state === State.Disconnected) {
      return
    }
    if (this.state !== State.Connected) {
      throw new Error(`[Readout] Can't close in state ${this.state}`)
    }
    return new Promise<void>((resolve, reject) => {
      this._state = State.Connecting
      this._mbusMaster.close((err) => {
        if (err) {
          this._state = State.Connected
          reject(err)
          return
        }
        this._state = State.Disconnected
        resolve()
      })
    })
  }

  public async readInputs(list: Array<ReadSlaveQuery> ): Promise<ReadSlaveResponse[]> {
    const dataList: ReadSlaveResponse[] = []

    for (const q of list) {
      const outAddr: ReadSlaveResponse = {
        query: q,
        data: new Array<ReadSlaveRecordData>()
      }
      dataList.push(outAddr)

      try {
        const rawData = await this.readAddress(q.primaryAddress)

        // Check serial number
        if (rawData.SlaveInformation.Id !== q.serial) {
          throw new Error(`[MBusReader] Primary ${q.primaryAddress}: Meter S/N ${rawData.SlaveInformation.Id} doesn't match S/N ${q.serial} in DB`)
        }

        // Get records
        for (const qRec of q.records) {
          const rec = rawData.DataRecord.find(item => {
            return item.id === qRec.recordId
          })
          if (!rec) {
            outAddr.data.push({
              recordId: qRec.recordId,
              error: new Error(`[MBusReader] Primary ${q.primaryAddress}: Record id ${qRec.recordId} not found on readout`)
            })
          } else {
            const value = rec.Value as number * Math.pow(10, (qRec.rescaleOrder || 0))
            const outRec: ReadSlaveRecordData = {
              recordId: rec.id as number,
              function: rec.Function as string,
              unit: rec.Unit as string,
              value: value,
              originalValue: rec.Value as number,
              timestamp: new Date(rec.Timestamp)
            }
            outAddr.data.push(outRec)
          }
        }
      } catch (e) {
        outAddr.error = new Error(`[MBusReadout] Error when reading/processing slave data. ${e}`)
      }
    }

    return dataList
  }

  public async readAddress(primary: number): Promise<any> {
    if (primary < 0 || primary > 252) {
      throw new Error(`[MBusReader] Can't read meter on address ${primary}. Out of range <0;252>.`)
    }
    if (this.state !== State.Connected) {
      throw new Error(`[MBusReader] Can't read meter on address ${primary}. Bus is not connected.`)
    }

    return new Promise((resolve, reject) => {
      this._mbusMaster.getData(primary, (err, data) => {
        if (err) {
          reject(err)
          return
        }
        resolve(data)
      })
    })
  }
}
