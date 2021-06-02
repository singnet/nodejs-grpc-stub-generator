
# ------------SUMMARY-------------
# $5 -> cd into temporary location

# $1 -> proto location
# $2 -> plugin location
# $3 -> output folder location
# $4 -> input proto file location
# -------------------------------

# step 1 --> cd into temp location
cd $5
# step 2 --> execute build.sh in temporary location
sh build.sh $1 $2 $3 $4 



# $1 --plugin=protoc-gen-ts=$2 --js_out=import_style=commonjs,binary:$3 --ts_out=service=grpc-web:$3 $4