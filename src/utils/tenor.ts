import { Tenor } from '@customTypes/tenor'

const tenor: Tenor = require('tenorjs').client({
  Key: process.env.TENOR_KEY,
  Filter: 'off',
  Locale: 'en_US',
  MediaFilter: 'minimal',
  DateFormat: 'D/MM/YYYY - H:mm:ss A',
})

export default tenor
