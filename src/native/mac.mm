#import <Cocoa/Cocoa.h>
#include <nan.h>

void ClearClipboard(const Nan::FunctionCallbackInfo<v8::Value>& info) {
  [[NSPasteboard generalPasteboard] clearContents];
}

void SetClipboardData(const Nan::FunctionCallbackInfo<v8::Value>& info) {
  if (info.Length() < 2) {
    Nan::ThrowTypeError("Wrong number of arguments");
    return;
  }
  if (!info[0]->IsString() || !node::Buffer::HasInstance(info[1])) {
    Nan::ThrowTypeError("Wrong arguments");
    return;
  }
  v8::String::Utf8Value type(info[0]->ToString());
  auto bytes = node::Buffer::Data(info[1]);
  auto length = node::Buffer::Length(info[1]);
  auto data = [NSData dataWithBytes:bytes length:length];
  auto pasteboard = [NSPasteboard generalPasteboard];
  [pasteboard setData:data forType:[NSString stringWithUTF8String:*type]];
}

void GetClipboardData(const Nan::FunctionCallbackInfo<v8::Value>& info) {
  if (info.Length() < 1) {
    Nan::ThrowTypeError("Wrong number of arguments");
    return;
  }
  if (!info[0]->IsString()) {
    Nan::ThrowTypeError("Wrong arguments");
    return;
  }
  v8::String::Utf8Value type(info[0]->ToString());
  auto pasteboard = [NSPasteboard generalPasteboard];
  auto data = [pasteboard dataForType:[NSString stringWithUTF8String:*type]];
  auto maybeBuffer = Nan::NewBuffer((char *)data.bytes, data.length);
  if (!maybeBuffer.IsEmpty()) {
    info.GetReturnValue().Set(maybeBuffer.ToLocalChecked());
  }
}
