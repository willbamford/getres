var getres = require('./')

getres(
  {
    image: {
      src: 'http://127.0.0.1:8080/test/img.png',
      type: 'image'
    }
  },
  (err, { image }) => {
    console.log('err', err)
    console.log('image', image)
  }
)
