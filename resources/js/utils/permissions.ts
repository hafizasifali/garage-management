export const can = (
  permissions: string[],
  permission: string
): boolean => {
  return permissions.includes(permission)
}
