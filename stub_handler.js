'use strict';
var utils = require('./utils')
const fs = require('fs')
const os = require('os')
const { S3 } = require('aws-sdk')
const uuid = require('uuid').v4;

const tmp = os.tmpdir()
const unique_id = uuid()
const download_file = path.join(tmp, `${unique_id}_download.zip`)
const extracted_file = path.join(tmp, `${unique_id}_extracted`)
const output_path = path.join(tmp, `${unique_id}_results`)
const generatedStubLocation = `${output_path}/${unique_id}_extracted`


module.exports.generate_node_stubs = async (event) => {
    try {
        console.log(`Generate proto :: ${JSON.stringify(event)}`)

        var stub = utils.getHostAndKeyFromUrl(event['stub_s3_url'])
        var proto = utils.getHostAndKeyFromUrl(event['proto_s3_url'])

        var file_objects = await utils.Lists3objects(proto.host, proto.path)
        console.log(file_objects)
        for (var i = 0; i < file_objects.length; i++) {
            const Isvalid = utils.ValidateUrlForS3(file_objects[i])
            if (path.extname(file_objects[i]) == '.zip' && Isvalid) {

                await utils.getS3Objects(proto.host, file_objects[i], download_file)
                await utils.extractFile(download_file, extracted_file)

                const extracted = await fs.promises.opendir(extracted_file)
                for await (const dirent of extracted) {
                    console.log(`Generating stub for ${dirent.name}`)
                    await utils.extractStubs(dirent.name, `${unique_id}_extracted`, output_path)
                }
            }
        }
        await utils.ZipFile(generatedStubLocation, `${tmp}/nodejs.zip`)
        utils.putS3Objects(stub.host, `${stub.path}/nodejs.zip`, `${tmp}/nodejs.zip`)
        return { "status": "success" }
    }
    catch (err) {
        console.log(`Error encountered :: ${err}`)
        throw err
    }
};

