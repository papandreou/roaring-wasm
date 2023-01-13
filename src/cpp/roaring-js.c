#include "global.h"

#include "CRoaringUnityBuild/roaring.h"

#define MAX_SERIALIZATION_NATIVE_MEMORY 0x00FFFFFF
#define SERIALIZATION_ARRAY_UINT32 1
#define SERIALIZATION_CONTAINER 2

bool roaring_bitmap_add_checked_js(roaring_bitmap_t * bitmap, uint32_t value) {
  uint32_t c = (uint32_t)roaring_bitmap_get_cardinality(bitmap);
  roaring_bitmap_add(bitmap, value);
  return c != (uint32_t)roaring_bitmap_get_cardinality(bitmap);
}

bool roaring_bitmap_remove_checked_js(roaring_bitmap_t * bitmap, uint32_t value) {
  uint32_t c = (uint32_t)roaring_bitmap_get_cardinality(bitmap);
  roaring_bitmap_remove(bitmap, value);
  return c != (uint32_t)roaring_bitmap_get_cardinality(bitmap);
}

bool roaring_bitmap_optimize_js(roaring_bitmap_t * bitmap) {
  bool result = false;
  for (int repeat = 0; repeat < 4; ++repeat) {
    if (roaring_bitmap_run_optimize(bitmap))
      result = true;
    if (roaring_bitmap_shrink_to_fit(bitmap))
      result = true;
    if (!result) {
      break;
    }
  }
  return result;
}

roaring_bitmap_t * roaring_bitmap_create_js(uint32_t capacity) {
  if (capacity < 4)
    capacity = 4;

  return roaring_bitmap_create_with_capacity(capacity);
}

double roaring_bitmap_select_js(const roaring_bitmap_t * bm, uint32_t rank) {
  uint32_t element;
  return roaring_bitmap_select(bm, rank, &element) ? element : NAN;
}

size_t roaring_bitmap_native_size_in_bytes_js(const roaring_bitmap_t * b) {
  if (b == NULL)
    return 0;

  uint64_t cardinality = roaring_bitmap_get_cardinality(b);
  uint64_t nativesize = cardinality * sizeof(uint32_t) + sizeof(uint32_t);
  size_t portablesize = roaring_bitmap_portable_size_in_bytes(b);

  if (nativesize < portablesize && nativesize < MAX_SERIALIZATION_NATIVE_MEMORY) {
    return nativesize + 1;
  }

  return portablesize + 1;
}

size_t roaring_bitmap_native_serialize_js(roaring_bitmap_t * b, char * serialized) {
  if (b == NULL)
    return 0;

  uint64_t cardinality = roaring_bitmap_get_cardinality(b);

  uint64_t nativesize = cardinality * sizeof(uint32_t) + sizeof(uint32_t);

  size_t portablesize = roaring_bitmap_portable_size_in_bytes(b);

  if (nativesize < portablesize && nativesize < MAX_SERIALIZATION_NATIVE_MEMORY) {
    serialized[0] = SERIALIZATION_ARRAY_UINT32;  // Marker
    memcpy(serialized + 1, &cardinality, sizeof(uint32_t));
    roaring_bitmap_to_uint32_array(b, (uint32_t *)(serialized + 1 + sizeof(uint32_t)));
    return (size_t)(nativesize + 1);
  } else {
    serialized[0] = SERIALIZATION_CONTAINER;  // Marker
    return roaring_bitmap_portable_serialize(b, serialized + 1) + 1;
  }
}

roaring_bitmap_t * roaring_bitmap_native_deserialize_js(const char * buf, uint32_t size) {
  if (!buf) {
    return NULL;  // Invalid arguments.
  }

  switch (buf[0]) {
    case SERIALIZATION_ARRAY_UINT32: {
      if (size == 1)
        return NULL;  // Empty.
      if (size < 5)
        return NULL;  // Wrong size!

      uint32_t card;
      memcpy(&card, buf + 1, sizeof(uint32_t));
      if (card == 0)
        return NULL;  // Empty.

      const uint32_t * elems = (const uint32_t *)(buf + 1 + sizeof(uint32_t));
      return roaring_bitmap_of_ptr(card, elems);
    }

    case SERIALIZATION_CONTAINER: {
      return roaring_bitmap_portable_deserialize(buf + 1);
    }
  }

  return NULL;  // Unknown marker.
}