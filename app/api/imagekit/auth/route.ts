import { getUploadAuthParams } from "@imagekit/next/server";

export async function GET() {
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;

    if (!privateKey || !publicKey) {
        return Response.json(
            { error: "Configuration ImageKit manquante" },
            { status: 500 }
        );
    }

    const { token, expire, signature } = getUploadAuthParams({
        privateKey,
        publicKey,
    });

    return Response.json({
        token,
        expire,
        signature,
        publicKey,
    });
}