var getres = require('./')
var lwip = require('lwip')

// lwip.open('/Users/will.bamford/Code/universal-render/getres/test/img.png', (err, image) => {
//   console.log('err', err);
//   console.log('image', image)
// })

getres(
  {
    image: {
      src: 'http://127.0.0.1:8080/test/img.png',
      type: 'image',
      parser: (resource) => {
        lwip.open(resource, 'png', (err, image) => {
          if (err) {
            console.log(err)
            return
          }
          // var w = image.width()
          // var h = image.height()
          // var buffer = image.__lwip.buffer()
          // console.log(buffer.length)
          // buffer.forEach((v) => {
          //   console.log(v)
          // })
          // var off4 = 0
          // for (var y = 0; y < h; y += 1) {
          //   for (var x = 0; x < w; x += 1) {
          //     console.log('R', buffer[y * w + x + off4 + 0])
          //     console.log('G', buffer[y * w + x + off4 + 1])
          //     console.log('B', buffer[y * w + x + off4 + 2])
          //     console.log('A', buffer[y * w + x + off4 + 3])
          //     off4 += 4
          //   }
          // }
        })
      }
    }
  },
  (err, { image }) => {
    console.log('err', err)
    // console.log('image', image)
  }
)
