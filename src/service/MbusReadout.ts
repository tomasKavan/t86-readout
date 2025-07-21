import MBusMaster, { MBusMasterOptions } from "node-mbus"
import { logger } from "./logger"

enum State {
  Disconnected = 'disconnected',
  Connecting = 'connecting',
  Connected = 'connected',
  Disconnecting = 'disconnecting'
}

export enum ErrCode {
  E_MBUS_CONNECTION = 'E_MBUS_CONNECTION',
  E_MBUS_SLAVE_READ = 'E_MBUS_SLAVE_READ',
  E_MBUS_SERIAL_MISMATCH = 'E_MBUS_SERIAL_MISMATCH',
}

export class MbusError extends Error {
  code: ErrCode

  constructor(code: ErrCode, message?: string) {
    super(message)
    this.code = code
  }
}

export type ReadSlaveRecordQuery = {
  recordId: number,
  decimalShift?: number
}

export type ReadSlaveQuery = {
  primaryAddress: number, 
  serial: string,
  records: ReadSlaveRecordQuery[]
}

export type ReadSlaveRecordData = {
  recordId: number,
  function?: string,
  unit?: string,
  value?: number,
  originalValue?: number
  timestamp?: Date,
  error?: MbusError
}

export type ReadSlaveResponse = {
  query: ReadSlaveQuery,
  data: ReadSlaveRecordData[],
  error?: MbusError
}

export class MbusReadout {

  private _config
  private _mbusMaster: MBusMaster
  private _state: State = State.Disconnected

  public get state(): State { return this._state }

  constructor(config: MBusMasterOptions) {
    this._config = config
    this._mbusMaster = new MBusMaster(config)
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

      let rawData: any = undefined
      let error: MbusError | undefined = undefined
      try {
        rawData = await this.readAddress(q.primaryAddress)
      } catch (e: any) {
        error = new MbusError(ErrCode.E_MBUS_CONNECTION, e.message)
      }

      if (!error) {
        if (String(rawData.SlaveInformation.Id) !== q.serial.toString()) {
          error = new MbusError(
            ErrCode.E_MBUS_SERIAL_MISMATCH, 
            `[MBusReader] Primary ${q.primaryAddress}: Meter S/N ${rawData.SlaveInformation.Id} doesn't match S/N ${q.serial} in DB`
          )
        }
      }

      // Get records
      for (const qRec of q.records) {
        if (error) {
          outAddr.data.push({
            recordId:qRec.recordId,
            error: error
          })
          continue
        }

        const rec = rawData.DataRecord.find((item: any) => {
          return item.id === qRec.recordId
        })
        if (!rec) {
          outAddr.data.push({
            recordId: qRec.recordId,
            error: new MbusError(
              ErrCode.E_MBUS_SLAVE_READ, 
              `[MBusReader] Primary ${q.primaryAddress}: Record id ${qRec.recordId} not found on readout`
            )
          })
          continue
        }
        const value = rec.Value as number * Math.pow(10, (qRec.decimalShift || 0))
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
