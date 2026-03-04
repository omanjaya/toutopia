import { Client } from "minio";
import { randomUUID } from "crypto";
import sharp from "sharp";

const WEBP_QUALITY = 80;
const CONVERTIBLE_TYPES = new Set(["image/jpeg", "image/png"]);

const endpoint = process.env.MINIO_ENDPOINT ?? "localhost";
const port = parseInt(process.env.MINIO_PORT ?? "9000", 10);
const bucket = process.env.MINIO_BUCKET ?? "uploads";
const publicUrl =
  process.env.NEXT_PUBLIC_MINIO_URL ?? `http://${endpoint}:${port}`;

export const minioClient = new Client({
  endPoint: endpoint,
  port,
  useSSL: process.env.MINIO_USE_SSL === "true",
  accessKey: process.env.MINIO_ACCESS_KEY ?? "",
  secretKey: process.env.MINIO_SECRET_KEY ?? "",
});

let bucketInitPromise: Promise<void> | null = null;

async function ensureBucket(): Promise<void> {
  if (bucketInitPromise) return bucketInitPromise;
  bucketInitPromise = (async () => {
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
  })();
  return bucketInitPromise;
}

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "application/pdf": "pdf",
};

async function convertToWebp(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();
}

export async function uploadFile(
  buffer: Buffer,
  contentType: string,
  folder: string = "questions"
): Promise<string> {
  await ensureBucket();

  let finalBuffer = buffer;
  let finalContentType = contentType;

  if (CONVERTIBLE_TYPES.has(contentType)) {
    finalBuffer = await convertToWebp(buffer);
    finalContentType = "image/webp";
  }

  const ext = MIME_TO_EXT[finalContentType] ?? "bin";
  const filename = `${folder}/${randomUUID()}.${ext}`;

  await minioClient.putObject(bucket, filename, finalBuffer, finalBuffer.length, {
    "Content-Type": finalContentType,
  });

  return `${publicUrl}/${bucket}/${filename}`;
}

export async function deleteFile(url: string): Promise<void> {
  const prefix = `${publicUrl}/${bucket}/`;
  if (!url.startsWith(prefix)) return;

  const objectName = url.slice(prefix.length);
  await minioClient.removeObject(bucket, objectName);
}
