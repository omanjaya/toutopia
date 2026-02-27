import { Client } from "minio";
import { randomUUID } from "crypto";

const endpoint = process.env.MINIO_ENDPOINT ?? "localhost";
const port = parseInt(process.env.MINIO_PORT ?? "9000", 10);
const bucket = process.env.MINIO_BUCKET ?? "uploads";
const publicUrl =
  process.env.NEXT_PUBLIC_MINIO_URL ?? `http://${endpoint}:${port}`;

const minioClient = new Client({
  endPoint: endpoint,
  port,
  useSSL: process.env.MINIO_USE_SSL === "true",
  accessKey: process.env.MINIO_ACCESS_KEY ?? "",
  secretKey: process.env.MINIO_SECRET_KEY ?? "",
});

let bucketReady = false;

async function ensureBucket(): Promise<void> {
  if (bucketReady) return;

  const exists = await minioClient.bucketExists(bucket);
  if (!exists) {
    await minioClient.makeBucket(bucket);
  }

  const policy = JSON.stringify({
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Principal: { AWS: ["*"] },
        Action: ["s3:GetObject"],
        Resource: [`arn:aws:s3:::${bucket}/*`],
      },
    ],
  });
  await minioClient.setBucketPolicy(bucket, policy);
  bucketReady = true;
}

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "application/pdf": "pdf",
};

export async function uploadFile(
  buffer: Buffer,
  contentType: string,
  folder: string = "questions"
): Promise<string> {
  await ensureBucket();

  const ext = MIME_TO_EXT[contentType] ?? "bin";
  const filename = `${folder}/${randomUUID()}.${ext}`;

  await minioClient.putObject(bucket, filename, buffer, buffer.length, {
    "Content-Type": contentType,
  });

  return `${publicUrl}/${bucket}/${filename}`;
}

export async function deleteFile(url: string): Promise<void> {
  const prefix = `${publicUrl}/${bucket}/`;
  if (!url.startsWith(prefix)) return;

  const objectName = url.slice(prefix.length);
  await minioClient.removeObject(bucket, objectName);
}
