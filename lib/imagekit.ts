

export async function deleteImageKitFile(fileId: string) {
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;

    if (!privateKey) {
        throw new Error(
            "IMAGEKIT_PRIVATE_KEY manquante"
        );
    }

    const response = await fetch(
        `https://api.imagekit.io/v1/files/${encodeURIComponent(fileId)}`,
        {
            method: "DELETE",
            headers: {
                Authorization:
                    "Basic " +
                    Buffer
                        .from(`${privateKey}:`)
                        .toString("base64"),
            },
        }
    );

    if (!response.ok) {
        const errorText =
            await response.text();

        throw new Error(
            `ImageKit delete failed: ${response.status} ${errorText}`
        );
    }

    return true;
}