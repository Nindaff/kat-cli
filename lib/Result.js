'use strict'

class Result {
  constructor(options) {
    this.name = options.name
    this.size = options.size
    this.files = options.files
    this.age = options.age
    this.seed = options.seed
    this.leech = options.leech
    this.link = options.link 
  }
}

module.exports = Result
