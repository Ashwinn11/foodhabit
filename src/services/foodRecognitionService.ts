/**
 * Food Recognition Service
 * Calls Supabase Edge Function to recognize foods using Google Vision API
 */

import { supabase } from '../config/supabase';
import { IdentifiedFood } from './scoringService';

export interface RecognitionResult {
    success: boolean;
    foods: IdentifiedFood[];
    error?: string;
}

/**
 * Recognize foods from an image using Google Vision API
 * @param imageUrlOrBase64 - Either a URL to an image or base64 encoded image data
 * @param isBase64 - Set to true if passing base64 data directly (faster)
 */
export async function recognizeFood(
    imageUrlOrBase64: string,
    isBase64: boolean = false
): Promise<IdentifiedFood[]> {
    try {
        const payload = isBase64
            ? { base64Image: imageUrlOrBase64 }
            : { imageUrl: imageUrlOrBase64 };

        console.log('Sending image to AI:', isBase64 ? '(base64 data)' : imageUrlOrBase64);

        const { data, error } = await supabase.functions.invoke('recognize-food', {
            body: payload,
        });

        if (error) {
            console.error('Error calling recognize-food function:', error);
            throw new Error(error.message);
        }

        if (!data.success) {
            throw new Error(data.error || 'Food recognition failed');
        }

        if (data.debug) {
            console.log('🔍 AI Debug Info:');
            console.log(`   Image Size: ${data.debug.imageSize} bytes`);
            console.log(`   Base64 Header: ${data.debug.base64Header}`);
            console.log('   All Labels found:', JSON.stringify(data.debug.allLabels, null, 2));
            if (data.debug.rawVisionResponse) {
                // Log only keys to avoid massive output
                console.log('   Raw Response Keys:', Object.keys(data.debug.rawVisionResponse));
                // Only log error part if exists
                if (data.debug.rawVisionResponse.error) {
                    console.log('   ⚠️ Raw API Error:', JSON.stringify(data.debug.rawVisionResponse.error));
                }
            }
        }

        return data.foods || [];
    } catch {
        console.error('Food recognition not available');
        return [];
    }
}
