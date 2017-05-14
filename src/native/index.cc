#include <nan.h>

void ClearClipboard(const Nan::FunctionCallbackInfo<v8::Value>& info);
void SetClipboardData(const Nan::FunctionCallbackInfo<v8::Value>& info);
void GetClipboardData(const Nan::FunctionCallbackInfo<v8::Value>& info);

void Init(v8::Local<v8::Object> exports) {
  exports->Set(Nan::New("clearClipboard").ToLocalChecked(),
               Nan::New<v8::FunctionTemplate>(ClearClipboard)->GetFunction());
  exports->Set(Nan::New("setClipboardData").ToLocalChecked(),
               Nan::New<v8::FunctionTemplate>(SetClipboardData)->GetFunction());
  exports->Set(Nan::New("getClipboardData").ToLocalChecked(),
               Nan::New<v8::FunctionTemplate>(GetClipboardData)->GetFunction());
}

NODE_MODULE(addon, Init)
