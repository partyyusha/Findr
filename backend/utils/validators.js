// Small checks used when reading request bodies

export function isEmail(value) {
  return typeof value === 'string' && /^\S+@\S+\.\S+$/.test(value.trim())
}

// trimmed string, or '' for anything that isn't a string
export function text(value) {
  return typeof value === 'string' ? value.trim() : ''
}
