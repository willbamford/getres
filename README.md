# 💎 Universal Asset Loader

For browser and Node.js asset loading. Designed to work with Canvas and WebGL.

Compatible with IE10+ and all other modern browsers (no requirement on Promises / ES6).

Inspired by [resl](https://github.com/mikolalysenko/resl).

Uses [Superagent](https://github.com/visionmedia/superagent) behind the scenes to fetch assets.

## API

```js
import load from 'universal-asset-loader';
load(
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

## Promises

Maybe coming soon.
