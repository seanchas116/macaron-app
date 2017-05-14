#include <nan.h>

namespace macaron {

void OpenClipboard(const Nan::FunctionCallbackInfo<v8::Value>& info);
void ClearClipboard(const Nan::FunctionCallbackInfo<v8::Value>& info);
void SetClipboardData(const Nan::FunctionCallbackInfo<v8::Value>& info);
void GetClipboardData(const Nan::FunctionCallbackInfo<v8::Value>& info);
void CloseClipboard(const Nan::FunctionCallbackInfo<v8::Value>& info);

}

void Init(v8::Local<v8::Object> exports) {
  exports->Set(Nan::New("openClipboard").ToLocalChecked(),
               Nan::New<v8::FunctionTemplate>(macaron::OpenClipboard)->GetFunction());
  exports->Set(Nan::New("clearClipboard").ToLocalChecked(),
               Nan::New<v8::FunctionTemplate>(macaron::ClearClipboard)->GetFunction());
  exports->Set(Nan::New("setClipboardData").ToLocalChecked(),
               Nan::New<v8::FunctionTemplate>(macaron::SetClipboardData)->GetFunction());
  exports->Set(Nan::New("getClipboardData").ToLocalChecked(),
               Nan::New<v8::FunctionTemplate>(macaron::GetClipboardData)->GetFunction());
  exports->Set(Nan::New("closeClipboard").ToLocalChecked(),
               Nan::New<v8::FunctionTemplate>(macaron::CloseClipboard)->GetFunction());
}

NODE_MODULE(addon, Init)
