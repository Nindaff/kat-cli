'use strict'

const querystring = require('querystring')
const url = require('url')
const got = require('got')

const nonEnumerable = (v) => ({ writable: false, enumerable: false, value: v })

class Torrent {
  constructor(options) {
    this.name = options.name
    this.size = options.size
    this.files = options.files
    this.age = options.age
    this.seed = options.seed
    this.leech = options.leech
    this.link = options.link

    let _url = url.parse(this.link)
    let _qs = querystring.parse(_url.query)
    Object.defineProperties(this, {
      _url: nonEnumerable(_url),
      _qs: nonEnumerable(_qs)
    })

    if (!this._url.protocol) this._url.protocol = 'https:'
  }

  getTorrent() {
    return got(this._url.format(), {
      encoding: null
    })
  }

  getFileName() {
    return `${this._qs.title.replace(/^\[[\w\.]+\]/, '').replace(/\.$/, '')}.torrent`
  }
}

module.exports = Torrent
