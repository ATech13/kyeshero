import { NextResponse } from "next/server";
import { deleteImageKitFile } from "../../../../../lib/imagekit";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ fileId: string }> }
) {
    try {
        const { fileId } = await params;

        if (!fileId) {
            return NextResponse.json(
                { error: "fileId manquant" },
                { status: 400 }
            );
        }

        await deleteImageKitFile(fileId);

        return new NextResponse(null, {
            status: 204,
        });

    } catch (error) {
        console.error(
            "DELETE IMAGEKIT FILE ERROR:",
            error
        );

        return NextResponse.json(
            {
                error:
                    "Impossible de supprimer le fichier ImageKit",
            },
            { status: 500 }
        );
    }
}