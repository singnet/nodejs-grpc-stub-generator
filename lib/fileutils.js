import ZipLocal from "zip-local";
import * as fs from "fs";
import * as path from "path";
import { protoExtension } from "../lib/constants.js";
import extract from "extract-zip";
import { emptyDirSync, copySync } from "fs-extra";

export const ZipFile = async (source, target) => {
  ZipLocal.sync.zip(source).compress().save(target);
};

export const getProtoPaths = async (base) => {
  var proto_paths = [];
  const dir = await fs.promises.opendir(base);
  for await (const dirent of dir) {
    if (dirent.name.endsWith(protoExtension)) {
      proto_paths.push(path.join(base, dirent.name));
    }
  }
  return proto_paths;
};

export const extractFile = async (source, target) => {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }
  await extract(source, { dir: target }, function (err) {
    if (err) {
      throw err;
    }
  });
};

export const clearDirectory = async (path) => {
  if (fs.existsSync(path)) {
    emptyDirSync(path);
  }
};

function canWrite(path, callback) {
  fs.access(path, fs.W_OK, function (err) {
    callback(null, !err);
  });
}

export const logFilePermissions = (path, message) => {
  canWrite(path, function (err, isWritable) {
    if (err) {
      console.log(err);
    } else {
      console.log(message + isWritable);
    }
  });
};

export const copyFiles = async (source, target) => {
  copySync(source, target, { overwrite: true }, function (err) {
    if (err) {
      console.error(err);
    } else {
      console.log("success!");
    }
  });
};

export const writeTextFile = async (target, content) => {
  fs.writeFileSync(target, content, err => {
    if (err) {
      console.error(err)
      return
    }
  })
}