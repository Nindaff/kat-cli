'use strict'

const fs = require('fs')
const should = require('should')
const Torrent = require('../../lib/Torrent')

const test = new Torrent({
  name: 'Javascript Unit Testing Video Training',
  size: '3.05 GB',
  files: '3',
  age: '2 months',
  seed: '7',
  leech: '3',
  link: '//torcache.net/torrent/6A74C131A2EEB2FCD64278453E53F18915ABDDB2.torrent?title=[kat.cr]javascript.unit.testing.video.training'
})

describe('Torrent', function() {

  it('getTorrent', () => {
    return test.getTorrent()
      .then((res) => {
        res.statusCode.should.equal(200)
        res.body.should.be.instanceOf(Buffer)
      })
  })
})
