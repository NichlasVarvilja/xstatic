'use strict'

const Test = require('blue-tape')
const Xstatic = require('../packages/core')

const Fs = require('fs')
const Libxml = require('libxmljs')

const Type = require('../packages/core/enum').changes

function setup(t, cb) {
  const project = new Xstatic('build')
  const files = project.glob('content/**/*.txt')
  const feed = require('../packages/plugin-atom')(project)
  const collection = feed(files, {
    url: 'http://localhost',
    title: 'test title',
    author: 'test author'
  })

  return cb(project, collection)
}

Test('creates feed of all posts', function(t) {
  return setup(t, function(project, collection) {
    const _ = project.utils

    return collection.update([

      {
        type: Type.A,
        lmod: 1445556599000,
        path: 'content/posts/2014/slug1/index.txt',
        load: _.lazyLoad({
          meta: { title: 'title post1' },
          lmod: 1445556599000,
          path: 'content/posts/2014/slug1/index.txt',
          body: 'post1'
        }),
      },
      {
        type: Type.A,
        lmod: 1445556599000 - 60*1000,
        path: 'content/posts/2015/slug1/index.txt',
        load: _.lazyLoad({
          meta: { title: 'title post2' },
          lmod: 1445556599000 - 60*1000,
          path: 'content/posts/2015/slug1/index.txt',
          body: 'post2'
        }),
      },

    ]).then(function(changes){

      t.ok(collection.length === 1, 'has result')

      const file = collection.get('feed.xml')

      t.ok(file, 'exists')

      return file.load.then(function(f){

        // console.log(f.body)

        t.doesNotThrow(function(){

          const xsd = Fs.readFileSync('./tests/plugin-atom.xsd').toString()
          const xsdDoc = Libxml.parseXml(xsd)
          const xmlDoc = Libxml.parseXml(f.body)
          const valid = xmlDoc.validate(xsdDoc)
          t.true(valid, 'valid xml')

          if (!valid) {
            xmlDoc.validationErrors.forEach(function(error){
              console.log('ERROR', error.line, error.message)
            })
          }
        })

      })
    })
  })
})
