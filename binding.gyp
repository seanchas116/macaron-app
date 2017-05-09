{
    "targets": [
        {
            "includes": [
                "auto.gypi"
            ],
            "sources": [
                "src/native/index.cc"
            ],
            "conditions": [
                ['OS=="mac"', {
                    'xcode_settings': {
                        'OTHER_CFLAGS': [
                            '-std=c++11',
                            '-stdlib=libc++'
                        ]
                    },
                    "sources": [
                        "src/native/ClipboardMac.mm"
                    ]
                }]
            ]
        }
    ],
    "includes": [
        "auto-top.gypi"
    ]
}
