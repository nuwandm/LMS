import cloudinary, { deleteFromCloudinary, getVideoDuration } from '../config/cloudinary.js';

/**
 * Upload video to Cloudinary
 * @param {String} filePath - Local file path
 * @param {String} folder - Cloudinary folder
 * @returns {Promise<Object>} Upload result
 */
export const uploadVideo = async (filePath, folder = 'lms/videos') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: 'video',
      transformation: [
        { width: 1280, height: 720, crop: 'limit', quality: 'auto' }
      ],
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      duration: result.duration || 0,
      format: result.format,
    };
  } catch (error) {
    console.error('Video upload error:', error);
    throw error;
  }
};

/**
 * Upload image to Cloudinary
 * @param {String} filePath - Local file path
 * @param {String} folder - Cloudinary folder
 * @returns {Promise<Object>} Upload result
 */
export const uploadImage = async (filePath, folder = 'lms/thumbnails') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: 'image',
      transformation: [
        { width: 1280, height: 720, crop: 'fill', quality: 'auto' }
      ],
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
    };
  } catch (error) {
    console.error('Image upload error:', error);
    throw error;
  }
};

/**
 * Delete video from Cloudinary
 * @param {String} publicId - Cloudinary public ID
 */
export const deleteVideo = async (publicId) => {
  return deleteFromCloudinary(publicId, 'video');
};

/**
 * Delete image from Cloudinary
 * @param {String} publicId - Cloudinary public ID
 */
export const deleteImage = async (publicId) => {
  return deleteFromCloudinary(publicId, 'image');
};

/**
 * Get video metadata
 * @param {String} publicId - Cloudinary public ID
 */
export const getVideoMetadata = async (publicId) => {
  try {
    const result = await cloudinary.api.resource(publicId, {
      resource_type: 'video'
    });
    return {
      duration: result.duration || 0,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
    };
  } catch (error) {
    console.error('Error getting video metadata:', error);
    throw error;
  }
};

export { getVideoDuration };
