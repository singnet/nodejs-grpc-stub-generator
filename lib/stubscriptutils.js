import * as path from "path";
import * as fs from "fs";
import * as os from "os";
import * as cp from "child_process";

const tmp = os.tmpdir();

const validateFileLocation = (fileLocation) => {
  if (!fs.existsSync(fileLocation)) {
    throw `${fileLocation} does not exists`;
  }
  return fileLocation;
};

export const extractStubs = async (protoFilePath, output_path, nodeModulesPath) => {
  const protoc = validateFileLocation(
    path.resolve(`${nodeModulesPath}/grpc-tools/bin/protoc`)
  );
  const nodeplugin = validateFileLocation(
    path.resolve(`${nodeModulesPath}/.bin/grpc_tools_node_protoc_plugin`)
  );
  if (!fs.existsSync(output_path)) {
    fs.mkdirSync(output_path, { recursive: true });
  }
  if (!fs.existsSync(`${tmp}/build.sh`)) {
    fs.copyFileSync("./proto/build.sh", `${tmp}/build.sh`);
  }
  console.log(`Generating proto for ${protoFilePath}`);
  const protoFolderPath = protoFilePath.replace(
    `/${path.basename(protoFilePath)}`,
    ""
  );

  cp.execSync(
    `sh ./proto/execute.sh ${protoc} ${output_path} ${nodeplugin} ${protoFolderPath} ${protoFilePath} ${tmp}`,
    function (err, stdout, stderr) {
      if (err) {
        console.log("Error in executing shell");
        throw err;
      }
      console.log(stdout);
    }
  );
};
