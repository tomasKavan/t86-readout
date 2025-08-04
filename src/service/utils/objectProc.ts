export function cleanObject<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined)
  ) as Partial<T>;
}

export function updateDefined<T extends object>(entity: T, partial: Partial<T>): T {
  return Object.assign(entity, cleanObject(partial))
}