# ------------SUMMARY-------------
# $7 -> cd into temporary location

# $1 -> proto location
# $2 -> output path
# $3 -> nodejs plugin
# $4 -> proto folder path
# $5 -> proto file path
# $6 -> js plugin 
# -------------------------------

cd $7
sh build.sh $1 $2 $3 $4 $5 $6 $7
