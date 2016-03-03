'use strict'

const should = require('should')
const Query = require('../../lib/Query')

const OPTS = [
  [{}, 'https://kat.cr/new/'],
  [{ query: 'test', field: 'age' }, 'https://kat.cr/usearch/test/?field=time_add&sorder=desc'],
  [{ category: 'tv' }, 'https://kat.cr/tv/'],
  [{ category: 'movies', query: 'test' }, 'https://kat.cr/usearch/test/'],
  [{ query: 'test test' }, 'https://kat.cr/usearch/test%20test/']
]

describe('Query', function() {
  it('options', () => {
    OPTS.forEach((tuple) => {
      new Query(tuple[0])._getURI().should.equal(tuple[1])
    })
  })

  it('_paginate()', () => {
    let query = new Query()
    query._paginate(-1)
    query._page.should.equal(0)

    query._paginate(1)
    query._page.should.equal(1)

    query._paginate(-1)
    query._page.should.equal(0)

    query._paginate(42)
    query._page.should.equal(1)
    query._paginate(1)
    query._page.should.equal(2)

    query._paginate(-1)
    query._page.should.equal(1)
  })

  it('lifecycle', () => {
    let query = new Query({ query: 'Unit Testing' })
    return query.next()
      .then((torrents) => {
        torrents.length.should.equal(25)
        let firstFirstName = torrents[0].name
        return query.prev()
          .then((torrents) => {
            torrents[0].name.should.equal(firstFirstName)
            return query.next()
          })
          .then((torrents) => {
            torrents[0].name.should.not.equal(firstFirstName)
            query.destroy()
            should(query.torrents).equal(null)
            should(query.options).equal(null)
            query._alive.should.equal(false)
            return query.next()
          })
          .then(() => {
            throw new Error('Should be dead')
          })
          .catch((err) => {
            err.message.should.equal('Query is dead')
          })
      })
  })
})
