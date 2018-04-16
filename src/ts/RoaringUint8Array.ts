import roaringWasm = require('./lib/roaring-wasm')
import RoaringTypedArray = require('./lib/RoaringTypedArray')

/**
 * Array of bytes allocted directly in roaring library WASM memory.
 * Note: Meory is not garbage collected, you are responsible to free the allocated memory calling "dispose" method.
 *
 * @class RoaringUint8Array
 */
class RoaringUint8Array extends RoaringTypedArray<Uint8Array> {
  public get BYTES_PER_ELEMENT(): number {
    return 1
  }

  public get byteLength(): number {
    return this.length
  }

  public get heap(): Uint8Array {
    return roaringWasm.HEAPU8
  }

  /**
   * Allocates an array in the roaring WASM heap.
   * Note: Meory is not garbage collected, you are responsible to free the allocated memory calling "dispose" method.
   *
   * @param {(number | RoaringUint8Array | Uint8Array | ReadonlyArray<number>)} lengthOrArray Length of the array to allocate or the array to copy
   */
  public constructor(lengthOrArray: number | Uint8Array | RoaringUint8Array | ReadonlyArray<number>) {
    super(lengthOrArray, 1)
  }

  public asTypedArray(): Uint8Array {
    return new Uint8Array(roaringWasm.wasmMemory.buffer, this.byteOffset, this.length)
  }

  public asNodeBuffer(): Buffer {
    return Buffer.from(roaringWasm.wasmMemory.buffer, this.byteOffset, this.length)
  }
}

export = RoaringUint8Array
