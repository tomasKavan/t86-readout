import { GraphQLScalarType, Kind } from "graphql"
import Big from "big.js"

export const BigScalar = new GraphQLScalarType({
  name: "Big",
  description: "Big decimal scalar representation",
  serialize(value: unknown): string {
    if (value instanceof Big) {
      return value.toString();
    }
    if (typeof value === 'string') {
      return value;
    }
    throw new Error(`BigScalar cannot serialize value: ${value}`);
  },
  parseValue(value: unknown): Big {
    if (typeof value === 'string') {
      return new Big(value);
    }
    throw new Error(`BigScalar cannot parse value: ${value}`);
  },
  parseLiteral(ast): Big {
    if (ast.kind === Kind.STRING) {
      return new Big(ast.value)
    }
    throw new Error(`BigScalar must be a string, is ${ast.kind}`)
  }
})
