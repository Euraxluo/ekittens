import {Injectable} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import {S3Client, PutObjectCommand} from "@aws-sdk/client-s3";
import {nanoid} from "nanoid";

@Injectable()
export class UploadService {
  constructor(private readonly configService: ConfigService) {}

  private readonly s3Client = new S3Client({
    credentials: {
      accessKeyId: this.configService.get("s3.accessKey"),
      secretAccessKey: this.configService.get("s3.secretAccessKey"),
    },
    endpoint: this.configService.get("s3.endpoint"),
    forcePathStyle: true,
    region: this.configService.get("s3.region"),
  });

  async upload(buffer: Buffer, mimetype: string) {
    const key = nanoid();
    const command = new PutObjectCommand({
      Bucket: this.configService.get("s3.bucketName"),
      Key: key,
      Body: buffer,
      ContentType: mimetype,
    });

    const response = await this.s3Client.send(command);
    return {
      Key: key,
      Location: `${this.configService.get("s3.endpoint")}/${this.configService.get("s3.bucketName")}/${key}`,
      ...response,
    };
  }
}
