import ZipLocal from "zip-local";
import * as fs from "fs";
import * as path from "path";

export const ZipFile = async (source, target) => {
  ZipLocal.sync.zip(source).compress().save(target);
};

export const getProtoPaths = async (base) => {
  var proto_paths = [];
  const dir = await fs.promises.opendir(base);
  for await (const dirent of dir) {
    var stat = fs.statSync(path.join(base, dirent.name));
    if (stat.isDirectory()) {
      const subDir = await fs.promises.opendir(path.join(base, dirent.name));
      for await (const subdirent of subDir) {
        if (subdirent.name.endsWith(".proto")) {
          proto_paths.push(path.join(base, dirent.name, subdirent.name));
        }
      }
    }
  }
  return proto_paths;
};
