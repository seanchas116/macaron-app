#include <codecvt>
#include <nan.h>

namespace macaron {

	void OpenClipboard(const Nan::FunctionCallbackInfo<v8::Value>& info) {
		if (info.Length() < 1) {
			Nan::ThrowTypeError("Wrong number of arguments");
			return;
		}
		if (!node::Buffer::HasInstance(info[0])) {
			Nan::ThrowTypeError("Wrong arguments");
			return;
		}
		auto bytes = node::Buffer::Data(info[0]);
		auto hwnd = *((HWND *)bytes);
		auto ok = ::OpenClipboard(hwnd);
		if (!ok) {
			Nan::ThrowError("Failed to open clipboard");
		}
	}

	void ClearClipboard(const Nan::FunctionCallbackInfo<v8::Value>& info) {
		EmptyClipboard();
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
		auto format = ::RegisterClipboardFormat(*type);

		auto hdata = ::GlobalAlloc(GMEM_MOVEABLE, length);
		if (!hdata) {
			return;
		}
		auto lockedData = static_cast<char*>(::GlobalLock(hdata));
		memcpy(lockedData, bytes, length);
		::GlobalUnlock(lockedData);
		if (!::SetClipboardData(format, hdata)) {
			::GlobalFree(hdata);
		}
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
		auto format = ::RegisterClipboardFormat(*type);
		auto data = ::GetClipboardData(format);

		auto maybeBuffer = Nan::NewBuffer((char *)::GlobalLock(data), (uint32_t)::GlobalSize(data));
		::GlobalUnlock(data);
		if (!maybeBuffer.IsEmpty()) {
			info.GetReturnValue().Set(maybeBuffer.ToLocalChecked());
		}
	}

	void CloseClipboard(const Nan::FunctionCallbackInfo<v8::Value>& info) {
		::CloseClipboard();
	}

}
