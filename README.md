# getres [![CircleCI](https://circleci.com/gh/WebSeed/getres.svg?style=svg)](https://circleci.com/gh/WebSeed/getres)

Resource loading in the Browser and Node.js  (text, JSON, binary, images) designed to work with HTML Canvas and WebGL.

Compatible with IE10+ and all other modern browsers (no requirement on Promises / ES6).

Uses [Superagent](https://github.com/visionmedia/superagent) behind the scenes to fetch assets.

## API

```js
import getres from 'getres'

getres(
  {
    text: {
      src: 'http://example.com/my.txt'
    },
    parsedText: {
      src: 'http://example.com/my.txt',
      parser: (resource) => resource.toUpperCase();
    },
    json: {
      src: 'http://example.com/my.json',
      type: 'json'
    },
    image: {
      src: 'http://example.com/my.jpg',
      type: 'image'
    }
  },
  (err, { text, parsedText, json, image }) => {
    /* Use resources... */
  },
  (progress) => { /* Coming soon */ }
)
```

### Promises

Coming soon...

```js
import getres from 'getres';
getres.p(manifest)
  .then((resources) => {})
  .catch((err) => {})
```

You must ensure the environment supports Promises (which can be achieved by [using a suitable polyfill](https://github.com/stefanpenner/es6-promise)).

## Credits

API and DOM element loading inspired by [resl](https://github.com/mikolalysenko/resl).
