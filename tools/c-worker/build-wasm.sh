#!/bin/sh
# Compile PicoC (sources patchées dans picoc/) en WebAssembly WASI avec zig, puis l'embarque en base64.
# Prérequis : pip install ziglang   (zig 0.17)
set -e
cd "$(dirname "$0")/picoc"
python3 -m ziglang cc -target wasm32-wasi -Os -s -DUNIX_HOST \
  -D_WASI_EMULATED_SIGNAL -D_WASI_EMULATED_PROCESS_CLOCKS -w \
  *.c platform/*.c cstdlib/*.c \
  -lm -lwasi-emulated-signal -lwasi-emulated-process-clocks -o ../picoc.wasm
cd ..
node -e 'const b=require("fs").readFileSync("picoc.wasm").toString("base64");require("fs").writeFileSync("picoc-wasm.js","export default \""+b+"\";\n")'
echo "picoc.wasm : $(wc -c < picoc.wasm) octets"
