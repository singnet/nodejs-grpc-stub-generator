# ------------SUMMARY-------------
# $6 -> cd into temporary location

# $1 -> proto location
# $2 -> output path
# $3 -> nodejs plugin
# $4 -> proto folder path
# $5 -> proto file path
# -------------------------------

cd $6
sh build.sh $1 $2 $3 $4 $5
