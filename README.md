# 💎 Swag

Universal asset loader (Node.js and browser).

Designed to work with WebGL.

Inspired by [resl](https://github.com/mikolalysenko/resl).

Uses [Superagent](https://github.com/visionmedia/superagent) behind the scenes.

## API

```js
swag(
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

## Promise

```
var swag = require('swag/promises')

const promise = swag({}, null, null, () => {});
```
