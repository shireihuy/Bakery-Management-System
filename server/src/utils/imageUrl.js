function resolveImageUrl(imageUrl) {
    if (!imageUrl) return imageUrl;
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

    const toCloudinaryUrl = (publicPath) => {
        if (!cloudName) return null;
        return `https://res.cloudinary.com/${cloudName}/image/upload/${publicPath}`;
    };

    const uploadPrefix = '/uploads/';

    if (imageUrl.startsWith(uploadPrefix)) {
        return toCloudinaryUrl(imageUrl.slice(uploadPrefix.length)) || imageUrl;
    }

    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        try {
            const parsed = new URL(imageUrl);
            const isLocalHost = ['localhost', '127.0.0.1', '::1'].includes(parsed.hostname);

            if (isLocalHost && parsed.pathname.startsWith(uploadPrefix)) {
                return toCloudinaryUrl(parsed.pathname.slice(uploadPrefix.length)) || imageUrl;
            }
        } catch (_) {
            // Ignore invalid URLs and return them unchanged below.
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
