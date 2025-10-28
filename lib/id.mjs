export const stableId = (site) => {
  return `${site.getFileName()}:${site.getLineNumber()}`
}

export const uniqueId = () => Math.random().toString(36).substring(2)
