describe('imageUrl', () => {
    const originalCloudName = process.env.CLOUDINARY_CLOUD_NAME;

    afterEach(() => {
        if (originalCloudName === undefined) {
            delete process.env.CLOUDINARY_CLOUD_NAME;
        } else {
            process.env.CLOUDINARY_CLOUD_NAME = originalCloudName;
        }
        vi.resetModules();
    });

    it('returns Cloudinary URLs unchanged', () => {
        const { resolveImageUrl } = require('./imageUrl');
        const url = 'https://res.cloudinary.com/demo/image/upload/v123/bakery-products/cake.jpg';
        expect(resolveImageUrl(url)).toBe(url);
    });

    it('converts legacy /uploads paths to Cloudinary URLs', () => {
        process.env.CLOUDINARY_CLOUD_NAME = 'demo-cloud';
        const { resolveImageUrl } = require('./imageUrl');
        expect(resolveImageUrl('/uploads/bakery-products/abc123')).toBe(
            'https://res.cloudinary.com/demo-cloud/image/upload/bakery-products/abc123'
        );
    });

    it('converts localhost upload URLs to Cloudinary URLs', () => {
        process.env.CLOUDINARY_CLOUD_NAME = 'demo-cloud';
        const { resolveImageUrl } = require('./imageUrl');
        expect(resolveImageUrl('http://localhost:3000/uploads/bakery-products/abc123')).toBe(
            'https://res.cloudinary.com/demo-cloud/image/upload/bakery-products/abc123'
        );
    });

    it('uses req.file.path for uploaded images', () => {
        const { getUploadedImageUrl } = require('./imageUrl');
        const url = 'https://res.cloudinary.com/demo/image/upload/bakery-products/new.jpg';
        expect(getUploadedImageUrl({ path: url })).toBe(url);
    });
});
