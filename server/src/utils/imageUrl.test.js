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

    it('returns legacy /uploads paths unchanged', () => {
        process.env.CLOUDINARY_CLOUD_NAME = 'demo-cloud';
        const { resolveImageUrl } = require('./imageUrl');
        expect(resolveImageUrl('/uploads/bakery-products/abc123')).toBe('/uploads/bakery-products/abc123');
    });

    it('returns bare legacy upload filenames unchanged', () => {
        process.env.CLOUDINARY_CLOUD_NAME = 'demo-cloud';
        const { resolveImageUrl } = require('./imageUrl');
        expect(resolveImageUrl('/uploads/1779168024705.png')).toBe('/uploads/1779168024705.png');
    });

    it('converts localhost upload URLs to relative upload paths', () => {
        process.env.CLOUDINARY_CLOUD_NAME = 'demo-cloud';
        const { resolveImageUrl } = require('./imageUrl');
        expect(resolveImageUrl('http://localhost:3000/uploads/bakery-products/abc123')).toBe('/uploads/bakery-products/abc123');
    });

    it('converts bare localhost filenames to relative upload paths', () => {
        process.env.CLOUDINARY_CLOUD_NAME = 'demo-cloud';
        const { resolveImageUrl } = require('./imageUrl');
        expect(resolveImageUrl('http://localhost:3000/uploads/1779168024705.png')).toBe('/uploads/1779168024705.png');
    });

    it('uses req.file.path for uploaded images', () => {
        const { getUploadedImageUrl } = require('./imageUrl');
        const url = 'https://res.cloudinary.com/demo/image/upload/bakery-products/new.jpg';
        expect(getUploadedImageUrl({ path: url })).toBe(url);
    });
});
