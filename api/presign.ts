import { S3Client, PutObjectCommand, GetObjectCommand, type PutObjectCommandInput, type GetObjectCommandInput } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { VercelRequest, VercelResponse } from '@vercel/node';

type PresignBody = {
    filename?: string;
    type?: string;
    duration?: string | number;
    contentType?: string;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const corsOrigin = process.env.MALWARE_CORS_ORIGIN || "*";
    res.setHeader("Access-Control-Allow-Origin", corsOrigin);
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");

    if (req.method === "OPTIONS") {
        return res.status(204).end();
    }

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const token = process.env.BEARER_TOKEN;
    if (token) {
        const auth = req.headers.authorization || "";
        if (auth !== `Basic ${token}`) {
            return res.status(401).json({ error: "Unauthorized" });
        }
    }

    const { filename, type, duration, contentType } = normalizeBody<PresignBody>(req.body);

    if (!filename || typeof filename !== "string") {
        return res.status(400).json({ error: "Missing filename" });
    }

    const method = typeof type === "string" ? type.toUpperCase() : undefined;
    if (method !== "PUT" && method !== "GET") {
        return res.status(400).json({ error: "Missing type (GET or PUT)" });
    }

    if (!process.env.DO_API_BUCKET || !process.env.DO_API_REGION) {
        return res.status(500).json({ error: "DigitalOcean Spaces environment variables are not configured" });
    }
    if (!process.env.DO_API_KEY || !process.env.DO_API_SECRET) {
        return res.status(500).json({ error: "Spaces credentials are missing" });
    }

    const expiresIn = durationToSeconds(duration);
    const endpoint = process.env.DO_API_ENDPOINT || `https://${process.env.DO_API_REGION}.digitaloceanspaces.com`;

    const s3 = new S3Client({
        region: process.env.DO_API_REGION,
        endpoint,
        forcePathStyle: false,
        credentials: {
            accessKeyId: process.env.DO_API_KEY,
            secretAccessKey: process.env.DO_API_SECRET,
        }
    });

    let command: PutObjectCommand | GetObjectCommand;
    if (method === "PUT") {
        const putParams: PutObjectCommandInput = {
            Bucket: process.env.DO_API_BUCKET,
            Key: filename,
            ContentType: typeof contentType === "string" && contentType.length > 0
                ? contentType
                : "application/octet-stream",
        };
        command = new PutObjectCommand(putParams);
    } else {
        const getParams: GetObjectCommandInput = {
            Bucket: process.env.DO_API_BUCKET,
            Key: filename,
        };
        command = new GetObjectCommand(getParams);
    }

    try {
        const url = await getSignedUrl(s3, command, { expiresIn });
        return res.status(200).json({
            url,
            method,
            filename,
            expiresIn,
            expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
        });
    } catch (error) {
        console.error("Failed to create presigned URL", error);
        return res.status(500).json({ error: "Failed to create presigned URL" });
    }
}

function normalizeBody<T>(body: unknown): T {
    if (!body) return {} as T;
    if (typeof body === "string") {
        try {
            return JSON.parse(body);
        } catch (err) {
            console.warn("Failed to parse JSON body", err);
            return {} as T;
        }
    }
    if (typeof Buffer !== "undefined" && Buffer.isBuffer(body)) {
        try {
            return JSON.parse(body.toString());
        } catch (err) {
            console.warn("Failed to parse buffer body", err);
            return {} as T;
        }
    }
    return (body ?? {}) as T;
}

function durationToSeconds(value: unknown) {
    if (typeof value === "number" && Number.isFinite(value)) {
        return Math.max(1, Math.round(value));
    }
    if (typeof value !== "string" || value.length === 0) {
        return 900;
    }
    const match = value.trim().match(/^(\d+)(s|m|h)$/i);
    if (!match) return 900;
    const amount = parseInt(match[1], 10);
    const unit = match[2].toLowerCase();
    switch (unit) {
        case "h":
            return amount * 3600;
        case "m":
            return amount * 60;
        default:
            return amount;
    }
}
