'use strict'

const Xstatic = require('xstatic-core')
const _ = require('@tcurdt/tinyutils')

module.exports = function(project) { return function(files, defaults) {

  const options =  _.merge({
    sort: function(a, b) { return a.path < b.path },
  }, defaults)

  const collection = new Xstatic.collection('ordered', [ files ], options)

  collection.build = function(create) {

    const sorted = files.sorted(options.sort)
    const len = sorted.length
    let curr = null
    for(var i=0; i<len; i++) {
      const prev = curr
      curr = sorted[i]
      const next = (i + 1) < len ? sorted[i+1] : null

      const meta = _.merge(curr.meta, {
        prev: prev,
        next: next,
        position: i,
        length: len
      })

      create(curr.path, meta, curr.load, [ curr ])
    }
  }

  return collection
}}
