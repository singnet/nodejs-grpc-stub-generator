import ZipLocal from "zip-local";
import * as fs from "fs";
import * as path from "path";
import { protoExtension } from "../lib/constants.js";
import extract from "extract-zip";

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