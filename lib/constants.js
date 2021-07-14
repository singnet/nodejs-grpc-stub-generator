export const s3Events = {
  OUTPUT_S3_PATH: "output_s3_path",
  INPUT_S3_PATH: "input_s3_path",
  ORG_ID: "org_id",
  SERVICE_ID: "service_id"
};

export const protoExtension = ".proto";

export const readmeInstructions = (service_id) => {
  return `INSTRUCTIONS:\n` +
    `1.${service_id}-proto contains proto files of the service.\n` +
    `2.${service_id}-grpc-stubs contains compiled grpc stubs required for invoking the service.\n` +
    `3.${service_id}-boilerplate contains the sample code.\n` +
    `NOTE:Please follow instructions provided in the nodejs tab of install and run on how to invoke the service.`
}