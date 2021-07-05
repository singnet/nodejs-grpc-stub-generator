import * as path from "path";
import * as fs from "fs";
import * as os from "os";
import * as cp from "child_process";

const tmp = os.tmpdir();

export const extractStubs = async (protoFilePath, output_path) => {
  const protoc = path.resolve("./node_modules/grpc-tools/bin/protoc");
  const nodeplugin = path.resolve("./node_modules/.bin/grpc_tools_node_protoc_plugin");
  const jsplugin = path.resolve("./node_modules/.bin/protoc-gen-ts");
  if (!fs.existsSync(protoc)) {
    console.log(" protoc file does not exists ");
  }
  if (!fs.existsSync(nodeplugin)) {
    console.log(" Node plugin file does not exists ");
  }
  if (!fs.existsSync(jsplugin)) {
    console.log(" js plugin file does not exists ");
  }
  if (!fs.existsSync(output_path)) {
    fs.mkdirSync(output_path, { recursive: true });
  }
  if (!fs.existsSync(`${tmp}/build.sh`)) {
    fs.copyFileSync("./proto/build.sh", `${tmp}/build.sh`);
  }
  console.log(`Generating proto for ${protoFilePath}`);
  const protoFolderPath = protoFilePath.replace(`/${path.basename(protoFilePath)}`,'')
  cp.execSync(
    `sh ./proto/execute.sh ${protoc} ${output_path} ${nodeplugin} ${protoFolderPath} ${protoFilePath} ${jsplugin} ${tmp}`,
    function (err, stdout, stderr) {
      if (err) {
        console.log("Error in executing shell");
        throw err;
      }
      console.log(stdout);
    }
  );
};
