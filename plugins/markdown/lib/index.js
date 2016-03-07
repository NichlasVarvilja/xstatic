'use strict'

const Xstatic = require('xstatic-core')

const _ = require('@tcurdt/tinyutils')
const Marked = require('marked')
const Highlight = require('highlight.js')

module.exports = function(project) { return function(files, defaults) {

  const renderer = new Marked.Renderer()
  const options =  _.merge({
    path: function(path) { return path.setExt('html') },
    marked: {
      highlight: function(code, lang) {
        return Highlight.highlightBlock(code).value
      },
      renderer: renderer
    }
  }, defaults)

  const collection = new Xstatic.collection('markdown', [ files ], options)

  function markdown(doc) {
    return new Promise(function(resolve, reject) {

      Marked(doc.body.toString(), options.marked, function(err, data) {
        if (err) {
          reject(err)
        } else {
          resolve(_.merge(doc, { body: new Buffer(data).toString() }))
        }
      })

    })
  }

  collection.build = function(create) {

    files.forEach(function(file) {
      create(_.merge(file, {
	path: file.path,
	load: file.load.then(markdown),
      }), [ file ])
    })
  }

  return collection
}}
