export interface UploadResult {
  url: string;
  fileId: string;
  name: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percent: number;
}

export async function uploadToImageKit(
  file: File,
  folder: "events" | "audios" | "covers" | "posts" | "quotes" = "events",
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  // Limite stricte de l'API ImageKit (environ 28 Mo max en payload direct)
  const MAX_IMAGEKIT_BYTES = 28 * 1024 * 1024;
  if (file.size > MAX_IMAGEKIT_BYTES) {
    const sizeMo = (file.size / (1024 * 1024)).toFixed(1);
    throw new Error(
      `Ce fichier pèse ${sizeMo} Mo. ImageKit limite les téléversements directs à 28 Mo. Veuillez compresser votre fichier MP3 ou renseigner un lien direct.`
    );
  }

  const authResponse = await fetch("/api/imagekit/auth");

  if (!authResponse.ok) {
    throw new Error("Impossible d'obtenir l'autorisation de téléversement auprès du serveur.");
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

  return new Promise<UploadResult>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "https://upload.imagekit.io/api/v1/files/upload");

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && event.total > 0) {
          const percent = Math.min(100, Math.round((event.loaded / event.total) * 100));
          onProgress({
            loaded: event.loaded,
            total: event.total,
            percent,
          });
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const uploadData = JSON.parse(xhr.responseText);
          resolve({
            url: uploadData.url,
            fileId: uploadData.fileId,
            name: uploadData.name,
          });
        } catch {
          reject(new Error("Réponse ImageKit invalide."));
        }
      } else if (xhr.status === 413) {
        reject(
          new Error("Fichier trop lourd : ImageKit a rejeté l'audio car il dépasse la limite de taille autorisée (28 Mo).")
        );
      } else if (xhr.status === 403) {
        reject(
          new Error("Accès refusé ou quota mensuel ImageKit atteint pour votre compte.")
        );
      } else {
        try {
          const errJson = JSON.parse(xhr.responseText);
          reject(new Error(errJson.message || `Erreur ImageKit (${xhr.status}).`));
        } catch {
          reject(new Error(`Échec du téléversement vers ImageKit (code ${xhr.status}).`));
        }
      }
    };

    xhr.onerror = () => {
      reject(
        new Error(
          "La connexion avec ImageKit a échoué (réseau instable ou fichier trop lourd pour votre débit montant). Réessayez ou compressez le fichier."
        )
      );
    };

    xhr.ontimeout = () => {
      reject(
        new Error(
          "Le délai de téléversement a expiré. Votre connexion internet est trop lente pour ce volume. Compressez le fichier en MP3."
        )
      );
    };

    xhr.send(formData);
  });
}
