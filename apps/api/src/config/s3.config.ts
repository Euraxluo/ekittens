import {registerAs} from "@nestjs/config";

export const s3Config = registerAs("s3", () => {
  const env = process.env;

  return {
    accessKey: env.S3_PUBLIC_KEY,
    secretAccessKey: env.S3_SECRET_KEY,
    bucketName: env.S3_BUCKET_NAME,
    endpoint: env.S3_ENDPOINT,
    region: env.S3_REGION || 'us-east-1',
  };
});
