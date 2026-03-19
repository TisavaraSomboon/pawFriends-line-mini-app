import { internal } from "@hapi/boom";
import dayjs from "dayjs";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const uploadTypes = [
  "user-profile",
  "pet-profile",
  "activity-image",
] as const;
type UploadTypes = (typeof uploadTypes)[number];

const S3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.S3_BUCKET_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "",
  },
});

const getParamsToSign = (type: UploadTypes) => {
  switch (type) {
    case "user-profile":
      return {
        folder: "UserProfile",
        allowed_formats: ["jpeg", "jpg", "png", "webp"],
        transformation: "w_2048,h_2048,c_limit",
      };
    case "pet-profile":
      return {
        allowed_formats: ["jpeg", "jpg", "png", "webp"],
      };
    case "activity-image":
      return {
        allowed_formats: ["jpeg", "jpg", "png", "webp"],
      };
    default:
      throw internal("INVALID_UPLOAD_TYPE");
  }
};

export const getSignedUrlFromR2 = async (
  fileName: string,
  type?: UploadTypes,
) => {
  const params = getParamsToSign(type ?? "activity-image");

  const timestamp = dayjs().subtract(57, "minutes").unix();

  const paramsWithTimestamp = {
    ...params,
    timestamp,
  };

  const putObjectCommand = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: fileName,
    ContentType: "multipart/form-data; boundary=ExampleBoundaryString",
  });

  const response = await getSignedUrl(S3, putObjectCommand, {
    expiresIn: 3600,
    ...paramsWithTimestamp,
  });

  return response;
};
