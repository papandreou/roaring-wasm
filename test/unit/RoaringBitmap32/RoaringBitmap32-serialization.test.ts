import IDisposable = require('idisposable')
import RoaringBitmap32 = require('roaring-wasm-papandreou/RoaringBitmap32')

describe("RoaringBitmap32 serialization", () => {
  let bitmap: RoaringBitmap32

  beforeAll(() => {
    bitmap = new RoaringBitmap32()
  })

  afterAll(() => {
    IDisposable.dispose(bitmap)
  })

  describe("getSerializationSizeInBytes", () => {
    it("returns standard value for empty bitmap (non portable)", () => {
      expect(bitmap.getSerializationSizeInBytes(false)).toEqual(5);
    });

    it("returns standard value for empty bitmap (portable)", () => {
      expect(bitmap.getSerializationSizeInBytes(true)).toEqual(8);
    });

    it("returns the correct amount of bytes (non portable)", () => {
      IDisposable.using(new RoaringBitmap32([1, 2, 3, 4, 5, 6, 100, 101, 105, 109, 0x7fffffff, 0xfffffffe, 0xffffffff]), bitmap => {
        expect(bitmap.getSerializationSizeInBytes(false)).toEqual(bitmap.serializeToNodeBuffer(false).byteLength);
        bitmap.optimize();
        //bitmap.shrinkToFit();
        expect(bitmap.getSerializationSizeInBytes(false)).toEqual(bitmap.serializeToNodeBuffer(false).byteLength);
      });
    });

    it("returns the correct amount of bytes (portable)", () => {
      IDisposable.using(new RoaringBitmap32([1, 2, 3, 4, 5, 6, 100, 101, 105, 109, 0x7fffffff, 0xfffffffe, 0xffffffff]), bitmap => {
        expect(bitmap.getSerializationSizeInBytes(true)).toEqual(bitmap.serializeToNodeBuffer(true).byteLength);
        bitmap.optimize();
        //bitmap.shrinkToFit();
        expect(bitmap.getSerializationSizeInBytes(true)).toEqual(bitmap.serializeToNodeBuffer(true).byteLength);
      });
    });
  });

  describe("serialize", () => {
    it("returns a Buffer", () => {
      expect(bitmap.serializeToNodeBuffer(false)).toBeInstanceOf(Buffer);
    });

    it("returns standard value for empty bitmap (non portable)", () => {
      expect(Array.from(bitmap.serializeToNodeBuffer(false))).toEqual([1, 0, 0, 0, 0]);
    });

    it("returns standard value for empty bitmap (portable)", () => {
      expect(Array.from(bitmap.serializeToNodeBuffer(true))).toEqual([58, 48, 0, 0, 0, 0, 0, 0]);
    });
  });

  describe("deserialize", () => {
    it("deserializes zero length buffer (non portable)", () => {
      IDisposable.using(new RoaringBitmap32([1, 2, 3]), bitmap => {
        bitmap.deserialize(Buffer.from([]), false);
        expect(bitmap.cardinality()).toEqual(0);
        expect(bitmap.isEmpty()).toEqual(true);
      });
    });

    it("deserializes empty bitmap (non portable)", () => {
      IDisposable.using(new RoaringBitmap32([1, 2, 3]), bitmap => {
        bitmap.deserialize(Buffer.from([1, 0, 0, 0, 0]), false);
        expect(bitmap.cardinality()).toEqual(0);
        expect(bitmap.isEmpty()).toEqual(true);
      });
    });

    it("deserializes empty bitmap (non portable)", () => {
      IDisposable.using(new RoaringBitmap32([1, 2, 3]), bitmap => {
        bitmap.deserialize(Buffer.from([1, 0, 0, 0, 0]), false);
        expect(bitmap.cardinality()).toEqual(0);
        expect(bitmap.isEmpty()).toEqual(true);
      });
    });

    it("deserializes empty bitmap (portable)", () => {
      IDisposable.using(new RoaringBitmap32([1, 2]), bitmap => {
        bitmap.deserialize(Buffer.from([58, 48, 0, 0, 0, 0, 0, 0]), true);
        expect(bitmap.cardinality()).toEqual(0);
        expect(bitmap.isEmpty()).toEqual(true);
      });
    });

    it("deserializes zero length buffer (portable)", () => {
      IDisposable.using(new RoaringBitmap32([1, 2]), bitmap => {
        bitmap.deserialize(Buffer.from([]), true);
        expect(bitmap.cardinality()).toEqual(0);
        expect(bitmap.isEmpty()).toEqual(true);
      });
    });

    it("is able to deserialize test data", () => {
      const testDataSerialized = require("./data/serialized.json");

      let total = 0;
      for (const s of testDataSerialized) {
        IDisposable.using(RoaringBitmap32.deserialize(Buffer.from(s, "base64"), false), bitmap => {
          const size = bitmap.cardinality();
          if (size !== 0) {
            expect(bitmap.contains(bitmap.minimum())).toEqual(true);
            expect(bitmap.contains(bitmap.maximum())).toEqual(true);
          }
          total += size;
        });
      }
      expect(total).toEqual(68031);
    });
  });

  describe("deserialize static", () => {
    it("deserializes zero length buffer (non portable)", () => {
      IDisposable.using(RoaringBitmap32.deserialize(Buffer.from([]), false), bitmap => {
        expect(bitmap.cardinality()).toEqual(0);
        expect(bitmap.isEmpty()).toEqual(true);
      });
    });

    it("deserializes zero length buffer (portable)", () => {
      IDisposable.using(RoaringBitmap32.deserialize(Buffer.from([]), true), bitmap => {
        expect(bitmap.cardinality()).toEqual(0);
        expect(bitmap.isEmpty()).toEqual(true);
      });
    });

    it("deserializes empty bitmap (non portable)", () => {
      IDisposable.using(RoaringBitmap32.deserialize(Buffer.from([1, 0, 0, 0, 0]), false), bitmap => {
        expect(bitmap.cardinality()).toEqual(0);
        expect(bitmap.isEmpty()).toEqual(true);
      });
    });

    it("deserializes empty bitmap (non portable)", () => {
      IDisposable.using(RoaringBitmap32.deserialize(Buffer.from([1, 0, 0, 0, 0]), false), bitmap => {
        expect(bitmap.cardinality()).toEqual(0);
        expect(bitmap.isEmpty()).toEqual(true);
      });
    });

    it("deserializes empty bitmap (non portable)", () => {
      IDisposable.using(RoaringBitmap32.deserialize(Buffer.from([1, 0, 0, 0, 0]), false), bitmap => {
        expect(bitmap.cardinality()).toEqual(0);
        expect(bitmap.isEmpty()).toEqual(true);
      });
    });

    it("deserializes empty bitmap (portable)", () => {
      IDisposable.using(RoaringBitmap32.deserialize(Buffer.from([58, 48, 0, 0, 0, 0, 0, 0]), true), bitmap => {
        expect(bitmap.cardinality()).toEqual(0);
        expect(bitmap.isEmpty()).toEqual(true);
      });
    });
  });

  describe("serialize, deserialize", () => {
    it("is able to serialize and deserialize data (non portable)", () => {
      const values = [1, 2, 100, 101, 105, 109, 0x7fffffff, 0xfffffffe, 0xffffffff];
      IDisposable.using(new RoaringBitmap32(values), a => {
        IDisposable.using(RoaringBitmap32.deserialize(a.serializeToNodeBuffer(false), false), b => {
          expect(b.toArray()).toEqual(values);
        });
      });
    });

    it("is able to serialize and deserialize data (portable)", () => {
      const values = [1, 2, 100, 101, 105, 109, 0x7fffffff, 0xfffffffe, 0xffffffff];
      IDisposable.using(new RoaringBitmap32(values), a => {
        IDisposable.using(RoaringBitmap32.deserialize(a.serializeToNodeBuffer(true), true), b => {
          expect(b.toArray()).toEqual(values);
        });
      });
    });

    it("is able to serialize and deserialize data (non portable frozen)", () => {
      const values = [1, 2, 100, 101, 105, 109, 0x7fffffff, 0xfffffffe, 0xffffffff];
      IDisposable.using(new RoaringBitmap32(values), a => {
        IDisposable.using(RoaringBitmap32.deserialize(a.serializeToNodeBuffer(false), false, true), b => {
          expect(b.toArray()).toEqual(values);
        });
      });
    });

    it("is able to serialize and deserialize data (portable frozen)", () => {
      const values = [1, 2, 100, 101, 105, 109, 0x7fffffff, 0xfffffffe, 0xffffffff];
      IDisposable.using(new RoaringBitmap32(values), a => {
        IDisposable.using(RoaringBitmap32.deserialize(a.serializeToNodeBuffer(true), true, true), b => {
          expect(b.toArray()).toEqual(values);
        });
      });
    });
  });
});
