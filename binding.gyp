{
    "targets": [
        {
            "target_name": "native",
            "include_dirs": [
                "<!(node -e \"require('nan')\")"
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
                        "src/native/mac.mm"
                    ]
                }]
            ]
        }
    ]
}
