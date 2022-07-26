import dayjs from 'dayjs'
import duration, { CreateDurationType } from 'dayjs/plugin/duration'

dayjs.extend(duration)

declare global {
  interface DateConstructor {
    duration: CreateDurationType
  }

  interface Date {
    /**
     * Turn a date into dayjs instance
     */
    toDayJs(this: Date): dayjs.Dayjs
    /**
     * Format to a date string
     * @param template Template string
     * @example date.format("HH:mm:ss MM/DD/YYYY")
     */
    format(this: Date, template: string): string
  }
}

Date.prototype.toDayJs = function (this: Date) {
  return dayjs(this)
}

Date.prototype.format = function (this: Date, template: string) {
  return dayjs(this).format(template)
}

Date.duration = dayjs.duration

export {}
