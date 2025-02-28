import configuration from './configuration';
import { S3ClientConfig } from '@aws-sdk/client-s3';

export const s3Config = (): S3ClientConfig => {
  const config = configuration();
  return {
    region: config.aws.region,
    endpoint: config.aws.endpoint,
    credentials: {
      accessKeyId: config.aws.accessKeyId,
      secretAccessKey: config.aws.secretAccessKey,
    },
    forcePathStyle: config.aws.forcePathStyle,
  };
};
