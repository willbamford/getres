# getres

Browser and Node.js resource loading (text, JSON, binary, images) designed to work with HTML Canvas and WebGL.

Compatible with IE10+ and all other modern browsers (no requirement on Promises / ES6).

Uses [Superagent](https://github.com/visionmedia/superagent) behind the scenes to fetch assets.

## API

```js
import getres from 'getres';
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
  () => {}, // On error
  () => {}, // On complete
  () => {}  // On progress
)
```

TODO: using with promises

## Credits

API and DOM element loading inspired by [resl](https://github.com/mikolalysenko/resl).
