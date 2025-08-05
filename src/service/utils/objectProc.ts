export function cleanObject<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined)
  ) as Partial<T>;
}

export function updateDefined<T extends object>(entity: T, partial: Partial<T>): T {
  return Object.assign(entity, cleanObject(partial))
}

export function mapKeysShallow(
  keys: string[],
  output: Record<string, any>,
  ...inputs: Record<string, any>[]
) {
  for (const key of keys) {
    const [sourceKey, targetKey = sourceKey] = key.split(':')

    let found = false
    for (const input of inputs) {
      if (Object.prototype.hasOwnProperty.call(input, sourceKey)) {
        output[targetKey] = input[sourceKey] // even if it's undefined
        found = true
        break
      }
    }

    if (!found) {
      delete output[targetKey]
    }
  }
}