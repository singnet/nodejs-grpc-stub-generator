import * as os from "os";
import { v4 as uuidv4 } from "uuid";
import * as path from "path";
import {
  getHostAndKeyFromUrl,
  putS3Objects,
  getS3FolderContents,
  getS3Objects,
  deleteS3Objects,
} from "../lib/s3botoutils.js";
import {
  ZipFile,
  getProtoPaths,
  extractFile,
  clearDirectory,
  copyFiles,
} from "../lib/fileutils.js";
import { extractStubs } from "../lib/stubscriptutils.js";
import { s3Events } from "../lib/constants.js";
import { InvokeBoilerPlateLambda } from "../lib/invokeBoilerplateLambda.js";
import { config } from "../config.js";
const tmp = os.tmpdir();
const unique_id = uuidv4();
const base = path.join(tmp, `${unique_id}_download`);
const temporary_paths = {
  base: base,
  upload: path.join(tmp, `${unique_id}_upload.zip`),
  result: path.join(tmp, `${unique_id}_nodejs`),
  boilerplate: path.join(tmp, `${unique_id}_boilerplate.zip`),
};

export const handler = async (event) => {
  try {
    console.log(`Generate proto :: ${JSON.stringify(event)}`);
    await clearDirectory(tmp);
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
        path.join(temporary_paths.result, "stubs")
      );
    }
    if (event[s3Events.OUTPUT_S3_PATH].length > 0) {
      //adding extracted proto into proto folder
      const protoOutputPath = path.join(temporary_paths.result, "proto");
      await copyFiles(temporary_paths.base, protoOutputPath);

      //upload generated nodejs stubs to S3
      await upload_result_to_s3(
        output.host,
        `${output.path}nodejstmp.zip`,
        temporary_paths.result
      );

      //generate boilerplate
      const output_path_details = output.path.split("/");
      const boilerPlateResponse = await InvokeBoilerPlateLambda(
        output_path_details[1],
        output_path_details[2],
        `https://${output.host}.s3.${config.REGION}.amazonaws.com/${output.path}nodejstmp.zip`
      );
      if (boilerPlateResponse.statusCode == 200) {
        await getS3Objects(
          config.BOILERPLATE_RESULT_BUCKET,
          `assets/${output_path_details[1]}/${output_path_details[2]}/stubs/nodejs-boilerplate.zip`,
          temporary_paths.boilerplate
        );
        await extractFile(
          temporary_paths.boilerplate,
          path.join(temporary_paths.result, "boilerplate")
        );
      }

      //upload generated nodejs boilerplate and stubs to S3
      await upload_result_to_s3(
        output.host,
        `${output.path}nodejs.zip`,
        temporary_paths.result
      );
    }
    return { statusCode: 200, status: "success" };
  } catch (err) {
    console.log(`Error encountered :: ${err}`);
    throw err;
  } finally {
    deleteS3Objects(output.host, `${output.path}nodejstmp.zip`);
  }
};

const upload_result_to_s3 = async (bucket, key, file) => {
  await ZipFile(temporary_paths.result, temporary_paths.upload);
  await putS3Objects(bucket, key, temporary_paths.upload);
};
