import { v2 as cloudinary } from "cloudinary";
import { nanoid } from "nanoid";
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadFiles = (fileBuffer: Buffer, fieldName: string, folder: string = ''): Promise<{ publicId: string, secureUrl: string }> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `requests/${folder}`,
        public_id: fieldName.split('.')[0].toLowerCase()
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // eliminar acentos
          .replace(/[^a-z0-9]/g, '-') // reemplazar caracteres especiales por guiones
          .replace(/-+/g, '-') // evitar múltiples guiones seguidos
          .replace(/^-|-$/g, '') // eliminar guiones al inicio y final
          + '-' + nanoid(6), // nombre del archivo + id unico de 6 caracteres
        resource_type: 'auto',
      },
      (error, result) => {
        if (error || !result) {
          console.error(error);
          return reject(new Error('Error al subir el archivo'));
        };
        
        resolve({ publicId: result.public_id, secureUrl: result.secure_url });
      }
    );

    uploadStream.end(fileBuffer);
  })
}

export const deleteFiles = (files: { publicId: string }[]) => {
  files.forEach(async (file) => {
    try {
      await cloudinary.uploader.destroy(file.publicId);
    } catch (error) {
      console.error('Error al eliminar el archivo:', error);
    }
  });
}
