'use strict'

const got = require('got')
const cheerio = require('cheerio')
const Torrent = require('./Torrent')

const KAT_HOST = 'kat.cr'
const KAT_FIELDS = {
  'files': 'files_count',
  'size': 'size',
  'age': 'time_add',
  'seed': 'seeders',
  'leech': 'leechers'
}

class Query {
  constructor(options) {
    this.options = Object.assign({
      category: 'new',
      query: null,
      field: null,
      fieldOrder: 'desc',
      hostName: KAT_HOST
    }, options || {})
    this.torrents = []
    this._page = 0
    this._started = false
    this._alive = true

    if (this.options.field) {
      this.options.field = this.options.field.toLowerCase()
    }
  }

  next() {
    if (!this._alive) return Promise.reject(new Error('Query is dead'))

    this._paginate(1)
    if (this.torrents[this._page]) {
      return Promise.resolve(this.torrents[this._page])
    }

    return got(this._getURI())
      .then((res) => {
        if (res.statusCode !== 200) {
          throw new Error('HTTP Error')
        }

        let torrents = this._parse(res.body)
        this.torrents.push(torrents)
        return torrents
      })
  }

  prev() {
    if (!this._alive) return Promise.reject(new Error('Query is dead'))

    this._paginate(-1)
    if (this.torrents[this._page]) {
      return Promise.resolve(this.torrents[this._page])
    }

    return this.next()
      .then((torrents) => {
        this._paginate(-1)
        return torrents
      })
  }

  destroy() {
    this.torrents = null
    this.options = null
    this._alive = false
  }

  _paginate(direction) {
    if (!this._started && this._page === 0) {
      return this._started = true
    }
    this._page += (direction / Math.abs(direction))
    if (this._page < 0) this._page = 0
  }

  _getURI() {
    let opts = this.options
    let uri = this.options.query
      ? `https://${opts.hostName}/usearch/${encodeURIComponent(opts.query)}/`
      : `https://${opts.hostName}/${opts.category}/`

    if (this._page > 0) {
      uri += `${this._page + 1}/`
    }
    if (opts.field && KAT_FIELDS.hasOwnProperty(opts.field)) {
      uri += `?field=${KAT_FIELDS[opts.field]}&sorder=${opts.fieldOrder}`
    }
    return uri
  }

  _parse(html) {
    const $ = cheerio.load(html)
    let $torrents = $('.even, .odd')
    let torrents = []

    $torrents.each((i, torrentElm) => {
      let $torrent = $(torrentElm)
      let $cells = $torrent.find('td')

      torrents.push(new Torrent({
        name: $torrent.find('a.cellMainLink').text(),
        size: $cells.eq(1).text(),
        files: $cells.eq(2).text(),
        age: $cells.eq(3).text(),
        seed: $cells.eq(4).text(),
        leech: $cells.eq(5).text(),
        link: $torrent.find('a[data-download]').attr('href')
      }))
    })

    return torrents
  }
}

module.exports = Query
