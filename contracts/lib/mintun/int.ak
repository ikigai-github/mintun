use aiken/builtin
use aiken/bytearray

/// Convert a bytearray into a base 10 integer.  
/// The byte array must be of even length.
/// This function was lifted from https://github.com/logicalmechanism/assist
pub fn from_hex_bytes(bytes: ByteArray) -> Int {
  bytearray.foldl(bytes, 0, fn(byte, acc) { acc * 256 + byte })
}

/// If possible parse an integer from a utf-8 string otherwise returns None.
///
/// ```aiken
/// from_string("BAD") == Some(14)
/// ```
pub fn from_utf8_bytes(bytes: ByteArray) -> Option<Int> {
  if bytearray.length(bytes) > 0 {
    bytearray.foldl(
      bytes,
      Some(0),
      fn(character, acc) {
        when acc is {
          Some(sum) -> {
            let maybe_decimal = from_utf8_code_point(character)
            when maybe_decimal is {
              Some(decimal) -> Some(sum * 16 + decimal)
              None -> None
            }
          }
          None -> None
        }
      },
    )
  } else {
    None
  }
}

test test_from_utf8_bytes() {
  and {
    from_utf8_bytes("ABC") == Some(2748),
    from_utf8_bytes("XYZ") == None,
    from_utf8_bytes("") == None,
    from_utf8_bytes("0") == Some(0),
    from_utf8_bytes("CAFEBAD") == Some(212855725),
  }
}

/// Internal function to convert a UTF8 code point to an an integer
fn from_utf8_code_point(code_point: Int) {
  when code_point is {
    0x30 -> Some(0)
    0x31 -> Some(1)
    0x32 -> Some(2)
    0x33 -> Some(3)
    0x34 -> Some(4)
    0x35 -> Some(5)
    0x36 -> Some(6)
    0x37 -> Some(7)
    0x38 -> Some(8)
    0x39 -> Some(9)
    0x41 -> Some(10)
    0x42 -> Some(11)
    0x43 -> Some(12)
    0x44 -> Some(13)
    0x45 -> Some(14)
    0x46 -> Some(15)
    0x61 -> Some(10)
    0x62 -> Some(11)
    0x63 -> Some(12)
    0x64 -> Some(13)
    0x65 -> Some(14)
    0x66 -> Some(15)
    _ -> None
  }
}

test test_from_utf8_code_point() {
  let converts_uppercase_d = test_convert_character("D", Some(13))
  let converts_lowercase_d = test_convert_character("d", Some(13))
  let converts_0 = test_convert_character("0", Some(0))
  let fails_x = test_convert_character("X", None)

  converts_uppercase_d && converts_lowercase_d && converts_0 && fails_x
}

fn test_convert_character(byte: ByteArray, expected: Option<Int>) {
  let converted = from_utf8_code_point(builtin.index_bytearray(byte, 0))
  converted == expected
}
