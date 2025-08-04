import { buildSchema } from "type-graphql"
import { DataSource } from "typeorm"
import { ApolloServer } from "@apollo/server"
import { startStandaloneServer } from '@apollo/server/standalone'

import { MeasPointResolver } from "./resolvers/MeasPointResolver"
import { MetricResolver } from "./resolvers/MetricResolver"
import { SerieResolver } from "./resolvers/SerieResolver"
import { ServiceEventResolver } from "./resolvers/ServiceEventResolver"


export type ApiConfigOptions = {
    port: number
}

export interface ApiContext {
  ds: DataSource
}

export default function configureApi (config: ApiConfigOptions) {
  return {
    start: async (ds: DataSource) => {
      const schema = await buildSchema({
        resolvers: [
          MeasPointResolver,
          MetricResolver,
          SerieResolver,
          ServiceEventResolver
        ]
      })

      const server = new ApolloServer<ApiContext>({ schema })
      const { url } = await startStandaloneServer(server, {
        context: async ({ req }) => {
          return { ds: ds }
        },
        listen: { port: config.port }
      })

      return url
    }
  }
}