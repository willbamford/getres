# getres

Browser and Node.js resource loading (text, JSON, binary, images) designed to work with HTML Canvas and WebGL.

Compatible with IE10+ and all other modern browsers (no requirement on Promises / ES6).

Uses [Superagent](https://github.com/visionmedia/superagent) behind the scenes to fetch assets.

## API

```js
import getres from 'getres'

getres(
  {
    data1: {
      url: 'http://www.example.com/data.json',
      parser: JSON.parse,
    },
    image1: 'http://www.example.com',
    image2: {
      url: 'http://www.example.com/image.jpg',
      parser: (data) => transform(data)
    }
  },
  (err) => { /* on error */ },
  (resources) => { /* on complete */ },
  (/* ... */) => { /* on progress */ }
)
```

### Promises

```js
import getres from 'getres';
getres.p(manifest)
  .then((resources) => {})
  .catch((err) => {})
```

You must ensure the environment supports Promises (which can be achieved by [using a suitable polyfill](https://github.com/stefanpenner/es6-promise)).

## Credits

API and DOM element loading inspired by [resl](https://github.com/mikolalysenko/resl).
