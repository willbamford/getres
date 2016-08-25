# getres [![CircleCI](https://circleci.com/gh/WebSeed/getres.svg?style=svg)](https://circleci.com/gh/WebSeed/getres)

Universal resource loading (browser and Node.js) designed to work with HTML5 Canvas and WebGL. Lightweight at only ~6KB when compressed with support for loading text, JSON and images.

Compatible with IE9+ and all other modern browsers with optional support for *promises*.

Uses [superagent](https://github.com/visionmedia/superagent) behind the scenes to make HTTP requests.

Image loading is achieved using the DOM API in the browser and [lwip](https://github.com/EyalAr/lwip) in Node.js.

## Install

```bash
npm i getres -S
```

## Examples

### Simple

Demonstrates how you load a single `image` resource using ES5 and good old fashioned callbacks.

```js
var getres = require('getres')

getres({
  photo: {
    src: 'http://example.com/photo.jpg'
  },
  function (err, resources) {
    if (err) {
      console.error(err)
      return
    }
    console.log('pic', resources.photo)
  }
})
```

### Kitchen sink

In one giant ball of config (the `manifest`), this ES6 example demonstrates most of the functionality of `getres` including:
* Loading different resource types: `text` (default), `json` and `image`.
* Using a `parser` function to transform the resource.
* Hooking into individual resource loading with `cb`.
* Accessing the _resource tree_ using promises (instead of traditional callback).
* Hooking into _progress_ events.

Note: to use promises you must ensure the environment supports these already. If you need to ensure support across browsers you can [use a suitable polyfill](https://github.com/stefanpenner/es6-promise#auto-polyfill). You can also set your own promise library with `getres.Promise = require('bluebird')` (swap Bluebird for your promise library of choice).

```js
import getres from 'getres'

getres({
  text: {
    src: 'http://example.com/my.txt'
  },
  parsedText: {
    src: 'http://example.com/my.txt',
    parser: (resource, cb) => cb(null, resource.toUpperCase()),
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

### Using a source array

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

### Using a source object

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

### Nested

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

## Credits

`getres` was created after trying (and failing) to get [resl](https://github.com/mikolalysenko/resl) working across Node.js and the browser, with a view to using it headlessly with the excellent [regl](https://github.com/mikolalysenko/regl) WebGL library and [headless-gl](https://github.com/stackgl/headless-gl). So, thanks to [mikolalysenko](https://github.com/mikolalysenko) and contributors for all of the above.
