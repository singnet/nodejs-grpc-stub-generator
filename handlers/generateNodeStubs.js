import * as os from "os";
import * as fs from "fs";
import { v4 as uuidv4 } from "uuid";
import * as path from "path";
import {
  Lists3objects,
  getHostAndKeyFromUrl,
  getS3Objects,
  putS3Objects,
  ValidateUrlForS3,
} from "../lib/s3botoutils.js";
import { extractFile, ZipFile } from "../lib/fileutils.js";
import { extractStubs } from "../lib/stubscriptutils.js";

const tmp = os.tmpdir();
const unique_id = uuidv4();
const download_file = path.join(tmp, `${unique_id}_download.zip`);
const extracted_file = path.join(tmp, `${unique_id}_extracted`);
const output_path = path.join(tmp, `${unique_id}_results`);
const generatedStubLocation = `${output_path}/${unique_id}_extracted`;

export const handler = async (event) => {
  try {
    console.log(`Generate proto :: ${JSON.stringify(event)}`);

    var stub = getHostAndKeyFromUrl(event["stub_s3_url"]);
    var proto = getHostAndKeyFromUrl(event["proto_s3_url"]);

    var file_objects = await Lists3objects(proto.host, proto.path);

    for (var i = 0; i < file_objects.length; i++) {
      const Isvalid = ValidateUrlForS3(file_objects[i]);
      if (path.extname(file_objects[i]) == ".zip" && Isvalid) {
        await getS3Objects(proto.host, file_objects[i], download_file);
        await extractFile(download_file, extracted_file);

        const extracted = await fs.promises.opendir(extracted_file);
        for await (const dirent of extracted) {
          console.log(`Generating stub for ${dirent.name}`);
          await extractStubs(
            dirent.name,
            `${unique_id}_extracted`,
            output_path
          );
        }
      }
    }
    await ZipFile(generatedStubLocation, `${tmp}/nodejs.zip`);
    await putS3Objects(stub.host, `${stub.path}/nodejs.zip`, `${tmp}/nodejs.zip`);
    return {"statusCode":200, "status": "success" };
  } catch (err) {
    console.log(`Error encountered :: ${err}`);
    throw err;
  }
};
