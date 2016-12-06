var fs = require('fs')
var path = require('path')

function load (name) {
  return fs.readFileSync(path.resolve('test/fixtures', name))
}

var expectLossless = {
  width: 2,
  height: 2,
  data: new Uint8ClampedArray([
    255, 0, 0, 255,
    0, 255, 255, 255,
    255, 255, 0, 255,
    0, 0, 255, 255
  ])
}

var expectJpeg = {
  width: 2,
  height: 2,
  data: new Uint8ClampedArray([
    254, 0, 0, 255,
    1, 255, 255, 255,
    255, 255, 1, 255,
    0, 0, 254, 255
  ])
}

module.exports = {
  png: {
    input: load('img.png'),
    expect: expectLossless
  },
  gif: {
    input: load('img.gif'),
    expect: expectLossless
  },
  jpg: {
    input: load('img.jpg'),
    expect: expectJpeg
  },
  corruptPng: {
    input: load('corrupt.png')
  }
}
