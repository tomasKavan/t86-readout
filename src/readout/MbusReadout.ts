import * as MbusMasterDef from "node-mbus"
const MbusMaster = MbusMasterDef.default

enum State {
  Disconnected = 'disconnected',
  Connecting = 'connecting',
  Connected = 'connected',
  Disconnecting = 'disconnecting'
}

export type ReadoutInput = {
  primaryAddress: number, 
  serial: number,
  recordId?: number, 
  rescaleOrder?: number
}
export type ReadoutValue = {
  recordId: number,
  function: string,
  unit?: string,
  value: number,
  originalValue: number
  timestamp: Date
}
export type ReadoutOutput = {
  input: ReadoutInput,
  data?: ReadoutValue,
  error?: Error
}
export type ByOneCallback = (output: ReadoutOutput) => Promise<void>

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

  public async readInputs(list: Array<ReadoutInput | number>, byOneClb?: ByOneCallback, clbBlocks?: boolean ): Promise<ReadoutOutput[]> {
    const dataList: ReadoutOutput[] = []

    for (let i = 0; i < list.length; i++) {
      const inpRec : ReadoutInput = typeof list[i] === 'number' ? {
        primaryAddress: list[i] as number
      } as ReadoutInput : list[i] as ReadoutInput
      if (!inpRec.recordId) {
        inpRec.recordId = 0
      }
      if (!inpRec.rescaleOrder) {
        inpRec.rescaleOrder = 0
      }

      try {
        const rawData = await this.readAddress(inpRec.primaryAddress)
        // Check serial number
        if (rawData.SlaveInformation.Id !== inpRec.serial) {
          throw new Error(`[MBusReader] Primary ${inpRec.primaryAddress}: Meter S/N ${rawData.SlaveInformation.Id} doesn't match S/N ${inpRec.serial} in DB`)
        }
        // get record
        const rec = rawData.DataRecord.find(item => {
          return item.id === inpRec.recordId || 0
        })
        if (!rec) {
          throw new Error(`[MBusReader] Primary ${inpRec.primaryAddress}: Record id ${inpRec.recordId} not found on readout`)
        }
        
        const value = rec.Value as number * Math.pow(10, (inpRec.rescaleOrder || 0))
        const outRec = {
          recordId: rec.id as number,
          function: rec.Function as string,
          unit: rec.Unit as string,
          value: value,
          originalValue: rec.Value as number,
          timestamp: new Date(rec.Timestamp)
        }
        try {
          const out = {
            input: inpRec,
            data: outRec
          }
          dataList.push(out)
          if (clbBlocks) {
            await byOneClb?.(out)
          } else {
            byOneClb?.(out)
          }
        } catch (e) {
          console.log(`[MBusReader] Primary ${inpRec.primaryAddress}: Callback function throws (${e}). This shouldn't hapen. Please fix your code.`)
        }
      } catch (e) {
        const out = {
          input: inpRec,
          error: e
        }
        dataList.push(out)
        if (clbBlocks) {
          await byOneClb?.(out)
        } else {
          byOneClb?.(out)
        }
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
