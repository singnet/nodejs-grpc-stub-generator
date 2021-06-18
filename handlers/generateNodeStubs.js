import * as os from "os";
import { v4 as uuidv4 } from "uuid";
import * as path from "path";
import {
  getHostAndKeyFromUrl,
  putS3Objects,
  getS3FolderContents,
} from "../lib/s3botoutils.js";
import { ZipFile, getProtoPaths } from "../lib/fileutils.js";
import { extractStubs } from "../lib/stubscriptutils.js";

const tmp = os.tmpdir();
const unique_id = uuidv4();
const base = path.join(tmp, `${unique_id}_download`);
const temporary_paths = {
  base: base,
  upload: path.join(tmp, `${unique_id}_upload.zip`),
  result: path.join(tmp, `${unique_id}_nodejs`),
};

export const handler = async (event) => {
  try {
    console.log(`Generate proto :: ${JSON.stringify(event)}`);
    if (event["output_s3_path"].length > 0) {
      var output = getHostAndKeyFromUrl(event["output_s3_path"]);
    }
    var input = getHostAndKeyFromUrl(event["input_s3_path"]);
    await getS3FolderContents(input.host, input.path, temporary_paths.base);
    var proto_paths = await getProtoPaths(base);
    if (proto_paths.length == 0) {
      throw `Proto files are not found in location ${base}`;
    }
    for (var i = 0; i < proto_paths.length; i++) {
      await extractStubs(
        proto_paths[i].replace("/tmp", "."),
        temporary_paths.result
      );
    }
    if (event["output_s3_path"].length > 0) {
      await ZipFile(
        path.join(temporary_paths.result, `${unique_id}_download`),
        temporary_paths.upload
      );
      await putS3Objects(
        output.host,
        `${output.path}nodejs.zip`,
        temporary_paths.upload
      );
    }
    return { statusCode: 200, status: "success" };
  } catch (err) {
    console.log(`Error encountered :: ${err}`);
    throw err;
  }
};
