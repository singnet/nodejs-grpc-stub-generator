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
import { s3Events } from "../lib/constants.js";
import { InvokeBoilerPlateLambda } from "../lib/invokeBoilerplateLambda.js"
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
    if (event[s3Events.OUTPUT_S3_PATH].length > 0) {
      var output = getHostAndKeyFromUrl(event[s3Events.OUTPUT_S3_PATH]);
    }
    var input = getHostAndKeyFromUrl(event[s3Events.INPUT_S3_PATH]);
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
    if (event[s3Events.OUTPUT_S3_PATH].length > 0) {
      const output_path_details = output.path.split('/')
      const boilerPlateResponse = InvokeBoilerPlateLambda(output_path_details[1], output_path_details[2])
      if (boilerPlateResponse == 'success'){
        //download boiler plate into --> temporary_paths.result
      }
      await ZipFile(temporary_paths.result, temporary_paths.upload);
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

const a = handler({
  input_s3_path:
    "s3://ropsten-service-components/assets/rajeev_june_25_org/calculator_june_25/proto_extracted/",
  output_s3_path: "s3://ropsten-service-components/assets/rajeev_june_25_org/calculator_june_25/temp"
});
