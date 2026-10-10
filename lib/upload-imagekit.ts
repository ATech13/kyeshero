export interface UploadResult {
  url: string;
  fileId: string;
  name: string;
}

export async function uploadToImageKit(
  file: File,
  folder: "events" | "audios" | "covers" | "posts" | "quotes" = "events"
): Promise<UploadResult> {
  const authResponse = await fetch("/api/imagekit/auth");

  if (!authResponse.ok) {
    throw new Error("Impossible d'obtenir l'autorisation d'upload");
  }

  const authData = await authResponse.json();

  const formData = new FormData();
  formData.append("file", file);
  formData.append("fileName", file.name);
  formData.append("publicKey", authData.publicKey);
  formData.append("signature", authData.signature);
  formData.append("expire", authData.expire.toString());
  formData.append("token", authData.token);
  formData.append("folder", `/church/${folder}`);

  const uploadResponse = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
    method: "POST",
    body: formData,
  });

  if (!uploadResponse.ok) {
    const errText = await uploadResponse.text();
    console.error("Échec de l'upload ImageKit:", errText);
    throw new Error("L'envoi du fichier vers le serveur a échoué.");
  }

  const uploadData = await uploadResponse.json();

  return {
    url: uploadData.url,
    fileId: uploadData.fileId,
    name: uploadData.name,
  };
}
