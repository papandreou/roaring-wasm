/* eslint node/no-unpublished-require:0 */

const RoaringUint32Array = require('../dist/RoaringUint32Array')
const RoaringBitmap32 = require('../dist/RoaringBitmap32')
const logging = require('../scripts/lib/logging')

function randomRoaringUint32Array(size, maxValue, seed = 18397123) {
  const set = new Set()
  while (set.size < size) {
    seed = (seed * 16807) % 2147483647
    set.add(seed & maxValue)
  }

  return new RoaringUint32Array(set)
}

const src = randomRoaringUint32Array(400000, 0xffffff)

const bitmap = new RoaringBitmap32()

logging.time(`add ${src.length} values`, () => {
  bitmap.addMany(src)
})

let buf

logging.time('serialize', () => {
  buf = bitmap.serializeToRoaringUint8Array()
  logging.log(buf.byteLength, 'bytes')
})
