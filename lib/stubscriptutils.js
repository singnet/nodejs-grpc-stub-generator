import * as path from "path";
import * as fs from "fs";
import * as os from "os";
import * as cp from "child_process";

const tmp = os.tmpdir();

export const extractStubs = async (protoName, protoFilePath, output_path) => {
  const protoc = path.resolve("./node_modules/protoc/protoc/bin/protoc");
  const plugin = path.resolve("./node_modules/ts-protoc-gen/bin/protoc-gen-ts");
  if (!fs.existsSync(protoc)) {
    console.log(" Protoc file does not exists ");
  }
  if (!fs.existsSync(plugin)) {
    console.log(" Plugin file does not exists ");
  }
  if (!fs.existsSync(output_path)) {
    fs.mkdir(path.join(output_path), (err) => {
      if (err) {
        return console.error(err);
      }
    });
  }
  fs.copyFileSync("./proto/build.sh", `${tmp}/build.sh`);
  cp.execSync(
    `sh ./proto/execute.sh ${protoc} ${plugin} ${output_path} ./${protoFilePath}/${protoName} ${tmp}`,
    function (err, stdout, stderr) {
      if (err) {
        console.log("Error in executing shell");
        throw err;
      }
      console.log(stdout);
    }
  );
};


