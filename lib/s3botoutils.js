import * as fs from "fs";
import * as url from "url";
import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { config } from "../config.js";
import * as Stream from "stream";

const s3 = new S3Client({ region: config["AWS_REGION"] });

export const ValidateUrlForS3 = (url) => {
  var s3ValidationPattern = new RegExp(config["S3_STUBS_REGEX_PATTERN"]);
  if (s3ValidationPattern.test(url)) {
    return true;
  } else {
    return false;
  }
};

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

export const getS3Objects = async (bucket, key, target) => {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });
  const { Body: readableStream } = await s3.send(command);

  return new Promise((resolve, reject) => {
    Stream.pipeline(readableStream, fs.createWriteStream(target), (err) => {
      if (err) {
        console.log("errrrrrrrr", err);
        reject(err);
      } else {
        console.log("Pipeline succeeded.");
        resolve("Pipeline succeeded.");
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
