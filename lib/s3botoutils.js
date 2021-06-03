import * as os from 'os'
import * as fs from 'fs'
import * as url from "url";
import {S3Client, ListObjectsV2Command, GetObjectCommand, PutObjectCommand} from '@aws-sdk/client-s3'
import { config } from '../config.js';
import * as strm from 'stream'

const s3 =  new S3Client({ region: config['AWS_REGION'] });
const tmp = os.tmpdir()

export const ValidateUrlForS3 = (url) => {
    var s3ValidationPattern = new RegExp(config["S3_STUBS_REGEX_PATTERN"])
    if (s3ValidationPattern.test(url)) {
        return true
    } else {
        return false
    }
}

export const getHostAndKeyFromUrl=(urlInput)=> {
    const newUrl = url.parse(urlInput)
    return {"host":newUrl.hostname,"path":newUrl.pathname.slice(1)}
}


export const Lists3objects = async (bucket, prefix) => {
    const command = new ListObjectsV2Command({
        Bucket: bucket, 
        Prefix: prefix
    });
    const response = await s3.send(command);
    var keys = []
    response.Contents.forEach(function (value) {
        if (value.Key != prefix + '/') {
            keys.push(value.Key)
        }
    });
    return keys
}

export const getS3Objects = async (bucket, key, target) => {
    const command = new GetObjectCommand({
        Bucket: bucket, 
        Key: key
    });
    const response = await s3.send(command);
 
    const writableStream = new strm.Writable()
    writableStream._write = (chunk, encoding, next) => {
        console.log(chunk.toString())
        fs.write(target,chunk,console.log)
        next()
    }
    
    response.Body.pipe(writableStream)
    writableStream.end()

    // fs.createWriteStream(target, response.Body)
}

export const putS3Objects = async (bucket, key, fileName) => {
    fs.chmodSync(fileName,0o755)
    const fileContent = fs.readFileSync(fileName);
    const command = new PutObjectCommand({
        Bucket: bucket, 
        Key: key,
        Body: fileContent
    });
    await s3.send(command);
}
