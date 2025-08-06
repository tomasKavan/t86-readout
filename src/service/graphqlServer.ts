import { buildSchema } from "type-graphql"
import { DataSource } from "typeorm"
import { ApolloServer } from "@apollo/server"
import { startStandaloneServer } from '@apollo/server/standalone'

import { MeasPointResolver } from "./resolvers/MeasPointResolver"
import { MetricResolver } from "./resolvers/MetricResolver"
import { SerieResolver } from "./resolvers/SerieResolver"
import { ReadoutResolver } from "./resolvers/ReadoutResolver"
import { Scheduler } from "./scheduler"
import { SchedulerResolver } from "./resolvers/SchedulerResolver"
import { MbusReadout } from "./readout/mbus/MbusReadout"
import { MBusQueryResolver } from "./resolvers/QueryMBusResolver"


export type ApiConfigOptions = {
    port: number
}

export interface ApiContext {
  ds: DataSource,
  sch: Scheduler,
  mbus: MbusReadout
}

export default function configureApi (config: ApiConfigOptions) {
  return {
    start: async (ds: DataSource, sch: Scheduler, mbus: MbusReadout) => {
      const schema = await buildSchema({
        resolvers: [
          MeasPointResolver,
          MetricResolver,
          ReadoutResolver,
          SerieResolver,
          SchedulerResolver,
          MBusQueryResolver
        ]
      })

      const server = new ApolloServer<ApiContext>({ schema })
      const { url } = await startStandaloneServer(server, {
        context: async ({ req }) => {
          return { ds: ds, sch: sch, mbus: mbus }
        },
        listen: { port: config.port }
      })

      return url
    }
  }
}