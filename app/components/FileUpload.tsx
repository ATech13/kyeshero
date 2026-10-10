"use client";

import { useEffect, useRef, useState } from "react";
import { FilePlus, X } from "lucide-react";
import { toast } from "sonner";

interface Props {
    type: "image" | "video";
    onFileChange: (file: File | null) => void;
    placeholder: string;
    accept: string;
}

const FileUpload = ({
    type,
    onFileChange,
    placeholder,
    accept,
}: Props) => {
    const inputRef =
        useRef<HTMLInputElement | null>(null);

    const [preview, setPreview] =
        useState<string | null>(null);

    const handleFileChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const selectedFile =
            e.target.files?.[0] ?? null;

        if (!selectedFile) return;

        // Vérification du type
        if (
            type === "image" &&
            !selectedFile.type.startsWith("image/")
        ) {
            toast.error(
                "Le fichier doit être une image"
            );

            return;
        }

        if (
            type === "video" &&
            !selectedFile.type.startsWith("video/")
        ) {
            toast.error(
                "Le fichier doit être une vidéo"
            );

            return;
        }

        // Limite image
        if (
            type === "image" &&
            selectedFile.size > 2 * 1024 * 1024
        ) {
            toast.error(
                "Veuillez mettre une image moins lourde"
            );

            return;
        }

        // Limite vidéo
        if (
            type === "video" &&
            selectedFile.size > 7 * 1024 * 1024
        ) {
            toast.error(
                "Veuillez mettre une vidéo moins lourde"
            );

            return;
        }

        // Supprimer l'ancienne preview
        if (preview) {
            URL.revokeObjectURL(preview);
        }

        // Preview locale uniquement
        const previewUrl =
            URL.createObjectURL(selectedFile);

        setPreview(previewUrl);

        // On transmet le File au formulaire
        // Aucun upload ici
        onFileChange(selectedFile);

        toast.success(
            type === "image"
                ? "Image sélectionnée"
                : "Vidéo sélectionnée"
        );
    };

    const removeFile = () => {
        if (preview) {
            URL.revokeObjectURL(preview);
        }

        setPreview(null);

        onFileChange(null);

        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    useEffect(() => {
        return () => {
            if (preview) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [preview]);

    return (
        <div className="flex w-full flex-col items-center gap-3">

            {/* INPUT */}

            <input
                ref={inputRef}
                type="file"
                accept={accept}
                onChange={handleFileChange}
                className="hidden"
            />

            {/* BOUTON */}

            {!preview && (
                <button
                    type="button"
                    className="btn btn-secondary btn-soft w-full max-w-xl rounded-lg"
                    onClick={() =>
                        inputRef.current?.click()
                    }
                >
                    <FilePlus className="h-4 w-4" />

                    <span className="text-sm">
                        {placeholder}
                    </span>
                </button>
            )}

            {/* PREVIEW IMAGE */}

            {preview && type === "image" && (
                <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={preview}
                        alt="Aperçu de l'image"
                        className="h-64 w-full max-w-xl rounded-xl object-cover"
                    />

                    <button
                        type="button"
                        onClick={removeFile}
                        className="btn btn-circle btn-sm absolute right-2 top-2"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* PREVIEW VIDEO */}

            {preview && type === "video" && (
                <div className="relative w-full max-w-xl">
                    <video
                        src={preview}
                        controls
                        className="h-64 w-full rounded-xl object-cover"
                    />

                    <button
                        type="button"
                        onClick={removeFile}
                        className="btn btn-circle btn-sm absolute right-2 top-2"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

        </div>
    );
};

export default FileUpload;