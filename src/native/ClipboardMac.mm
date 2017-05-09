#import <Cocoa/Cocoa.h>
#include "nbind/api.h"

class Clipboard {
  NSPasteboard *pasteboard_;
public:

  Clipboard() {
    pasteboard_ = [NSPasteboard generalPasteboard];
  }

  void clear() {
    [pasteboard_ clearContents];
  }

  void setData(const std::string& type, nbind::Buffer buf) {
    auto data = [NSData dataWithBytes:buf.data() length:buf.length()];
    [pasteboard_ setData:data forType:[NSString stringWithUTF8String:type.c_str()]];
  }
};

#include "nbind/nbind.h"

NBIND_CLASS(Clipboard) {
  construct<>();
  method(clear);
  method(setData);
}
