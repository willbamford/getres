# getres [![CircleCI](https://circleci.com/gh/WebSeed/getres.svg?style=svg)](https://circleci.com/gh/WebSeed/getres)

Resource loading in the browser and Node.js  (text, JSON, binary, images) designed to work with HTML5 Canvas and WebGL.

Compatible with IE10+ and all other modern browsers (Promise support optional)

Uses [Superagent](https://github.com/visionmedia/superagent) behind the scenes to fetch assets.

Image loading is achieved using the DOM API in the browser and [lwip](https://github.com/EyalAr/lwip) in Node.js.

## API

TODO...

## Examples

### Using Promises

To use Promises you must ensure the environment supports these already. If you need to ensure support across browsers you can [use a suitable polyfill](https://github.com/stefanpenner/es6-promise#auto-polyfill)).

```js
import getres from 'getres'

getres({
  text: {
    src: 'http://example.com/my.txt'
  },
  parsedText: {
    src: 'http://example.com/my.txt',
    parser: (resource, cb) => cb(null, resource.toUpperCase());
  },
  json: {
    src: 'http://example.com/my.json',
    type: 'json'
  },
  image: {
    src: 'http://example.com/my.jpg',
    type: 'image'
  }
}).then(({ text, parsedText, json, image }) => {
  /* Do something with resources */
}).catch((err) => {
  console.err(err)
})
```

### Using Callbacks

If your environment doesn't support Promises you can use good old fashioned callbacks:

```js
import getres from 'getres';

getres({
  text: {
    src: 'http://example.com/my.txt'
  },
  (err, resources) => {
    if (err) {
      console.error(err)
      return
    }
    /* Do something with resources */
  }
})
```

### Using a source array

```js
import getres from 'getres'

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
  console.err(err)
})
```

### Using a source object

```js
import getres from 'getres'

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
  console.err(err)
})
```

### Nested

```js
import getres from 'getres'

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
  console.log('images.alpha', images.alpha)
  console.log('images.beta', images.beta)
}).catch((err) => {
  console.err(err)
})
```

## Credits

API and DOM element loading inspired by [resl](https://github.com/mikolalysenko/resl).
