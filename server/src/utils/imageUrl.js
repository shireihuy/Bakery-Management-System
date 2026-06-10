function resolveImageUrl(imageUrl) {
    if (!imageUrl) return imageUrl;
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl;
    }
    if (imageUrl.startsWith('/uploads/')) {
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        if (cloudName) {
            const publicPath = imageUrl.slice('/uploads/'.length);
            return `https://res.cloudinary.com/${cloudName}/image/upload/${publicPath}`;
        }
    }
    return imageUrl;
}

function getUploadedImageUrl(file) {
    if (!file) return undefined;
    if (file.path) return file.path;
    if (file.secure_url) return file.secure_url;
    if (file.filename) return resolveImageUrl(`/uploads/${file.filename}`);
    return undefined;
}

module.exports = { resolveImageUrl, getUploadedImageUrl };
