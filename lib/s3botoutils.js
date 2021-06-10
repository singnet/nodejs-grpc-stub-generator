import * as fs from "fs";
import * as url from "url";
import * as path from "path";
import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { config } from "../config.js";
import * as Stream from "stream";

const s3 = new S3Client({ region: config["AWS_REGION"] });

export const getHostAndKeyFromUrl = (urlInput) => {
  const newUrl = url.parse(urlInput);
  return { host: newUrl.hostname, path: newUrl.pathname.slice(1) };
};

export const Lists3objects = async (bucket, prefix) => {
  const command = new ListObjectsV2Command({
    Bucket: bucket,
    Prefix: prefix,
  });
  const response = await s3.send(command);
  var keys = [];
  response.Contents.forEach(function (value) {
    if (value.Key != prefix + "/") {
      keys.push(value.Key);
    }
  });
  return keys;
};

export const getS3FolderContents = async (bucket, key, target) => {
  var keys = await Lists3objects(bucket, key);
  for (var i = 0; i < keys.length; i++) {
    var fileDetails = getPathAndFilenameFromPath(keys[i]);
    var fileOrFolder = keys[i].replace(key, "");
    var subFolderStructure = "";
    if (fileOrFolder.includes("/")) {
      subFolderStructure = fileDetails.filepath.replace(key, "");
    }
    var target_path = path.join(target, subFolderStructure);
    if (!fs.existsSync(target_path)) {
      fs.mkdirSync(target_path, { recursive: true }),
        (err) => {
          if (err) {
            reject(err);
          }
        };
    }
    await getS3Objects(
      bucket,
      keys[i],
      path.join(target_path, fileDetails.filename)
    );
  }
};

const getPathAndFilenameFromPath = (input_path) => {
  var filepath = input_path.substr(0, input_path.lastIndexOf("/"));
  var filename = path.basename(input_path);
  return { filepath: filepath, filename: filename };
};

export const getS3Objects = async (bucket, key, target) => {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });
  const { Body: readableStream } = await s3.send(command);
  return new Promise((resolve, reject) => {
    Stream.pipeline(readableStream, fs.createWriteStream(target), (err) => {
      if (err) {
        console.log("Error downloading file from s3", err);
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

export const putS3Objects = async (bucket, key, fileName) => {
  fs.chmodSync(fileName, 0o755);
  const fileContent = fs.readFileSync(fileName);
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: fileContent,
  });
  await s3.send(command);
};
