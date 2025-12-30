/**
 * Image Processing Utilities
 * Optimizes images for faster upload and AI processing
 */

import { File } from 'expo-file-system';

/**
 * Optimize image for AI processing
 * For now, just returns the original URI since we've already reduced camera quality
 * In production builds with native modules, this could do actual resizing
 */
export async function optimizeImageForAI(uri: string): Promise<string> {
    try {
        console.log('🖼️ Preparing image for AI...');

        // Check file size using new API
        try {
            const file = new File(uri);
            const size = await file.size;
            const sizeKB = Math.round(size / 1024);
            console.log(`   Image size: ${sizeKB}KB`);

            // If image is already small (due to quality: 0.5), no need to optimize further
            if (sizeKB < 500) {
                console.log('✅ Image already optimized');
                return uri;
            }

            console.log('⚠️ Large image detected, but proceeding with current size');
        } catch (sizeError) {
            console.log('   Could not check size, proceeding anyway');
        }

        return uri;
    } catch (error) {
        console.error('Error checking image:', error);
        return uri;
    }
}

/**
 * Convert image to base64 string
 * Used for direct API calls without storage upload
 */
export async function imageToBase64(uri: string): Promise<string> {
    try {
        console.log('📦 Converting image to base64...');
        const startTime = Date.now();

        // Use new File API
        const file = new File(uri);
        const base64 = await file.base64();

        const endTime = Date.now();
        console.log(`✅ Base64 conversion completed in ${endTime - startTime}ms`);
        console.log(`   Size: ${Math.round(base64.length / 1024)}KB`);

        return base64;
    } catch (error) {
        console.error('Error converting to base64:', error);
        throw error;
    }
}

/**
 * Get image file size in bytes
 */
export async function getImageSize(uri: string): Promise<number> {
    try {
        const file = new File(uri);
        return await file.size;
    } catch (error) {
        console.error('Error getting file size:', error);
        return 0;
    }
}
