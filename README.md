# getres

<a href="https://circleci.com/gh/WebSeed/getres">
  <img
    src="https://circleci.com/gh/WebSeed/getres.svg?style=shield"
    alt="Build status" />
</a>
<a href="https://npmjs.org/package/getres">
  <img
    src="https://img.shields.io/npm/v/getres.svg?style=flat-square"
    alt="NPM version" />
</a>
<a href="https://standardjs.com">
  <img
    src="https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square"
    alt="Standard" />
</a>
<a href="https://npmcdn.com/getres/dist/getres.min.js">
   <img
    src="https://badge-size.herokuapp.com/WebSeed/getres/master/dist/getres.min.js.svg?compression=gzip"
    alt="File size" />
</a>

Universal resource loading (browser and Node.js) designed to work with HTML5 Canvas and WebGL. Supports loading text, JSON, binary and images.

**getres** is lightweight and compatible with IE9+ and all other modern browsers with support for *promises* optional.

## Simple example

```js
var getres = require('getres')

getres(
  {
    photo: {
      src: 'http://example.com/photo.jpg',
      type: 'image',
    }
  },
  function (err, resources) {
    if (err) {
      console.error(err)
      return
    }
    console.log('photo', resources.photo)
  }
)
```

This example uses ES5 and traditional callbacks. See further down the README for more examples which include: loading multiple resources; loading arrays; objects and nested resources; using the *parser* function; use of promises; and hooking into *progress* events.

## Getting started

```bash
npm i getres -S
```

Then:

```js
var getres = require('getres')

// Or with ES6
import getres from 'getres'
```

## API

You can use **getres** with or without promises. First without:

```js
var getres = require('getres')

getres(
  config,
  function (err, res) { },
  function (progress) { } /* Optional */
)
```

Now with promises:

```js
getres(config)
  .then(function (res) { })
  .catch(function (err) { })

/* Or with progress listener */
getres(config, null, function (progress) { })
  .then(function (res) { })
  .catch(function (err) { })
```

### Config

An `object` where the *keys* correspond to the name of each resource and the *value* is itself an object with the following properties **or** *key(s)* for [nested resources](#nested-example):

| Name          | Description                                                                                                                                                                                                  | Default |
|:--------------|:-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:--------|
| `src`         | Resource URL(s) to load. Can be a [`string`](#simple-example), [`array`](#source-array-example) or [`object`](#source-object-example)                                                                        |         |
| `type`        | `text`, `json` or `image`                                                                                                                                                                                    | `text`  |
| `parser`      | A `function` used to transform the resource (*optional*). The function can [directly return the transformed resource or pass the transformed resource to a callback e.g. for async.](#sync-and-async-parser) |         |
| `cb`          | A `function` to hook into an individual resource's load events (*optional*)                                                                                                                                  |         |
| `credentials` | For [CORS](https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_enabled_image)                                                                                                                             | `false` |

### Using promises

To use promises you must ensure the environment supports these already. For some older browsers you may need to [use a suitable polyfill](https://github.com/stefanpenner/es6-promise#auto-polyfill). Alternatively you can also set your own promise library with `getres.Promise = require('bluebird')` (swap [Bluebird](https://github.com/petkaantonov/bluebird) for your library of choice).

## Examples

All of these examples use ES6 syntax which may require *transpilation* to work across browsers.

### Kitchen sink example

In one giant ball of `config`, this ES6 example demonstrates most of the functionality of **getres** including:

* Loading different resource types: `text` (default), `json` and `image`.
* Using a `parser` function to transform the resource.
* Hooking into individual resource loading with the `cb` function.
* Accessing the `resource` tree using promises instead of callbacks.
* Hooking into _progress_ events.

```js
import getres from 'getres'

getres({
  text: {
    src: 'http://example.com/my.txt'
  },
  parsedText: {
    src: 'http://example.com/my.txt',
    parser: (resource) => resource.toUpperCase(),
    cb: (err, resource) => {
      if (err) {
        console.error(err)
        return
      }
      console.log('resource', resource)
    }
  },
  json: {
    src: 'http://example.com/my.json',
    type: 'json'
  },
  image: {
    src: 'http://example.com/my.jpg',
    type: 'image'
  },
  null, // Indicates you want to use promises
  (progressEvent)
    => { /* Do something with progress event */ }
}).then(({ text, parsedText, json, image }) => {
  /* Do something with resources */
}).catch((err) => {
  console.error(err)
})
```

### Source array example

```js
getres({
  image: {
    src: 'http://example.com/my.txt',
    type: ''
  },
  cube: {
    src: [
      'http://example.com/pos-x.png',
      'http://example.com/neg-x.png',
      'http://example.com/pos-y.png',
      'http://example.com/neg-y.png',
      'http://example.com/pos-z.png',
      'http://example.com/neg-z.png'
    ],
    type: 'image'
  }
}).then(({ image, cube }) => {
  console.log('image', image)
  console.log(
    'cube x, -x, y, -y, z, -z:',
    cube[0], cube[1], cube[2], cube[3], cube[4], cubemap[5]
  )
}).catch((err) => {
  console.error(err)
})
```

### Source object example

```js
getres({
  image: {
    src: 'http://example.com/my.txt',
    type: ''
  },
  cube: {
    src: {
      xp: 'http://example.com/pos-x.png',
      xn: 'http://example.com/neg-x.png',
      yp: 'http://example.com/pos-y.png',
      yn: 'http://example.com/neg-y.png',
      zp: 'http://example.com/pos-z.png',
      zn: 'http://example.com/neg-z.png'
    },
    type: 'image'
  }
}).then(({ image, cube }) => {
  console.log('image', image)
  console.log(
    'cube x, -x, y, -y, z, -z:',
    cube.xp, cube.xn, cube.yp, cube.yn, cube.yp, cube.yn
  )
}).catch((err) => {
  console.error(err)
})
```

### Nested example

```js
getres({
  text: { src: 'http://example.com/text.txt' }
  images: {
    alpha: {
      src: 'http://example.com/alpha.png',
      type: 'image'
    },
    beta: {
      src: 'http://example.com/beta.png',
      type: 'image'
    }
  }
}).then(({ text, images }) => {
  console.log('text', text)
  console.log('images', images.alpha, images.beta)
}).catch((err) => {
  console.error(err)
})
```

### Sync and async parser

```js
getres({
  sync: {
    src: 'http://example.com/foo.txt',
    parser: (resource) => resource.toUpperCase()
  },
  async: {
    src: 'http://example.com/bar.txt',
    parser: (resource, cb) => {
      setTimeout(() => {
        cb(resource.toUpperCase())
      }, 1000)
    }
  },
  (err, resource) => {}
}
```

## Development

To test:

```bash
npm test
```

Contributions welcome!

## Credits

**getres** was created after trying and failing to get [resl](https://github.com/mikolalysenko/resl) working across Node.js and the browser, with a view to using it headlessly with the excellent [regl](https://github.com/mikolalysenko/regl) WebGL library and [headless-gl](https://github.com/stackgl/headless-gl). So, the API resemblance between both libraries is strong. Thanks to [mikolalysenko](https://github.com/mikolalysenko) and contributors for all of the above.

**getres** uses [superagent](https://github.com/visionmedia/superagent) behind the scenes to make HTTP requests.

Image loading is achieved using the DOM API in the browser and [lwip](https://github.com/EyalAr/lwip) in Node.js.
