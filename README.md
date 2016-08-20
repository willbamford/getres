# getres [![CircleCI](https://circleci.com/gh/WebSeed/getres.svg?style=svg)](https://circleci.com/gh/WebSeed/getres)

Resource loading in the Browser and Node.js  (text, JSON, binary, images) designed to work with HTML Canvas and WebGL.

Compatible with IE10+ and all other modern browsers (Promises optional)

Uses [Superagent](https://github.com/visionmedia/superagent) behind the scenes to fetch assets.

## API

### Using Promises

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

You must ensure the environment supports Promises. If you need to ensure support across browsers you can [use a suitable polyfill](https://github.com/stefanpenner/es6-promise#auto-polyfill)).

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

## Credits

API and DOM element loading inspired by [resl](https://github.com/mikolalysenko/resl).
