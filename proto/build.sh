#Generate js files
$1 \
 --js_out=import_style=commonjs,binary:$2 \
 --grpc_out=$2 \
 --plugin=protoc-gen-grpc=$3 \
  -I $4 $5

# Generate ts files
$1 \
    --plugin=protoc-gen-ts=$6 \
    --ts_out=$2 \
    -I $4 $5

# Referance for debugging
# add any proto sample.proto into proto folder then execute below code
# # Generate JavaScript code
# ./node_modules/grpc-tools/bin/protoc \
#     --js_out=import_style=commonjs,binary:./proto \
#     --grpc_out=./proto \
#     --plugin=protoc-gen-grpc=./node_modules/.bin/grpc_tools_node_protoc_plugin \
#     -I ./proto \
#     ./proto/sample.proto

# # Generate TypeScript code (d.ts)
# ./node_modules/grpc-tools/bin/protoc \
#     --plugin=protoc-gen-ts=./node_modules/.bin/protoc-gen-ts \
#     --ts_out=./proto \
#     -I ./proto \
#     ./proto/sample.proto

    