#include "global.h"

#include "CRoaringUnityBuild/roaring.h"

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

roaring_bitmap_t * roaring_bitmap_deserialize_frozen_js(const char* buf) {
  if (buf[0] == 2) {
    // portable format
    return roaring_bitmap_portable_deserialize_frozen(buf+1);
  } else {
    return roaring_bitmap_deserialize(buf);
  }
}