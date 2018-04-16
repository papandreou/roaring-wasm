import IDisposable = require('roaring/IDisposable')
import roaringWasm = require('roaring/lib/roaring-wasm')
import RoaringUint32Array = require('roaring/RoaringUint32Array')

function sameInstance(a: any, b: any): boolean {
  return a === b
}

describe('RoaringUint32Array', () => {
  describe('constructor', () => {
    it('allows creating empty arrays', () => {
      IDisposable.using(new RoaringUint32Array(0), p => {
        console.log(p)
        expect(p.length).toBe(0)
        expect(p.byteLength).toBe(0)
        expect(p.byteOffset).toBe(0)
        expect(p.BYTES_PER_ELEMENT).toBe(4)
        expect(p.heap).toBeInstanceOf(Uint32Array)
        expect(p.buffer).toBeInstanceOf(ArrayBuffer)
        expect(sameInstance(p.heap, roaringWasm.HEAPU32)).toBe(true)
        expect(sameInstance(p.buffer, roaringWasm.wasmMemory.buffer)).toBe(true)
        expect(p.toArray()).toEqual([])
      })
    })

    it('allows creating a small array', () => {
      IDisposable.using(new RoaringUint32Array(12), p => {
        expect(p.length).toBe(12)
        expect(p.byteLength).toBe(12 * 4)
        expect(p.byteOffset).toBeGreaterThan(0)
        expect(p.BYTES_PER_ELEMENT).toBe(4)
        expect(p.heap).toBeInstanceOf(Uint32Array)
        expect(p.buffer).toBeInstanceOf(ArrayBuffer)
        expect(sameInstance(p.heap, roaringWasm.HEAPU32)).toBe(true)
        expect(sameInstance(p.buffer, roaringWasm.wasmMemory.buffer)).toBe(true)
      })
    })

    it('copies arrays', () => {
      IDisposable.using(new RoaringUint32Array([1, 2, 0xffffffff]), p => {
        expect(p.length).toBe(3)
        expect(p.byteLength).toBe(12)
        expect(p.byteOffset).toBeGreaterThan(0)
        expect(p.toArray()).toEqual([1, 2, 0xffffffff])
      })
    })
  })
})
