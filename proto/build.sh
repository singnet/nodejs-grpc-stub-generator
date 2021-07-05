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

    