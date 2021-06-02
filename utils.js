const aws = require('aws-sdk');
const fs = require('fs')
var extract = require('extract-zip')
var cp = require('child_process');
path = require('path');
var os = require('os');
var config = require('./config').items
var zipper = require('zip-local');

aws.config.update({
    region: config['AWS_REGION']
});
const s3 = new aws.S3();

tmp = os.tmpdir()

const ValidateUrlForS3 = (url) => {
    var s3ValidationPattern = new RegExp(config["S3_STUBS_REGEX_PATTERN"])
    if (s3ValidationPattern.test(url)) {
        return true
    } else {
        return false
    }
}

const Lists3objects = async (bucket, Key, target) => {
    var params = {
        Bucket: bucket,
        Prefix: Key
    };
    return new Promise(function (resolve, reject) {
        s3.listObjectsV2(params, function (err, data) {
            keys = []
            if (err) console.log(err, err.stack);
            else {
                for (var i = 0; i < data.Contents.length; i++) {
                    if (data.Contents[i].Key != params.Prefix + '/') {
                        keys.push(data.Contents[i].Key)
                    }
                }
            }
            resolve(keys)
        });
    });
}

const getS3Objects = async (bucket, key, target) => {
    const params = {
        Bucket: bucket,
        Key: key
    };
    return new Promise(function (resolve, reject) {
        data = s3.getObject(params, function (err, data) {
            if (err) {
                reject(err)
            }
            fs.writeFileSync(target, data.Body)
            resolve()
        });
    });
}

const getHostAndKeyFromUrl=(url)=> {
    newUrl = new URL(url)
    return {"host":newUrl.hostname,"path":newUrl.pathname.slice(1)}
}

const extractStubs = async(protoName,protoFilePath,output_path) => {
    protoc= path.resolve('./node_modules/protoc/protoc/bin/protoc')
    plugin = path.resolve('./node_modules/ts-protoc-gen/bin/protoc-gen-ts')
    if(!fs.existsSync(protoc)){console.log(" Protoc file does not exists ")}
    if(!fs.existsSync(plugin)){console.log(" Plugin file does not exists ")}
    if(!fs.existsSync(output_path)){
        fs.mkdir(path.join(output_path), (err) => {
            if (err) {
                return console.error(err);
            }
        });
    }
    fs.copyFileSync('./proto/build.sh',`${tmp}/build.sh`)
    cp.execSync(`sh ./proto/execute.sh ${protoc} ${plugin} ${output_path} ./${protoFilePath}/${protoName} ${tmp}`, function (err, stdout, stderr) {
        if (err) {
            console.log("Error in executing shell")
          throw err;
        }
        console.log(stdout)
      });
}

const extractFile = async(source, target) => {
    await extract(source, { dir: target }, function (err) {
        if (err) {
            throw err
        }
    })
}

const ZipFile = async(source, target) =>{
    zipper.sync.zip(source).compress().save(target);
}

const putS3Objects = async (bucket, key, fileName) => {
    fs.chmodSync(fileName,0o755)
    const fileContent = fs.readFileSync(fileName);
    const params = {
        Bucket: bucket,
        Key: key,
        Body: fileContent
    };
    return new Promise(function (resolve, reject) {
        data = s3.upload(params, function (err, data) {
            if (err) {
                reject(err)
            }
            resolve()
        });
    });
}

module.exports = {
    extractFile,
    getS3Objects,
    extractStubs,
    ZipFile,
    putS3Objects,
    getHostAndKeyFromUrl,
    Lists3objects,
    ValidateUrlForS3
}

    
