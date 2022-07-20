declare global {
  interface String {
    /**
     * Capitalizes the string
     */
    capitalize(this: string): string
  }
}

String.prototype.capitalize = function (this: string) {
  return this[0].toUpperCase() + this.substring(1).toLowerCase()
}

export {}
