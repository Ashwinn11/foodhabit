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
 */
export async function recognizeFood(imageUrl: string): Promise<IdentifiedFood[]> {
    try {
        console.log('Sending image to AI:', imageUrl);
        const { data, error } = await supabase.functions.invoke('recognize-food', {
            body: { imageUrl },
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
    } catch (error) {
        console.error('Error recognizing food:', error);
        throw error;
    }
}

/**
 * Check if food recognition is available
 */
export async function isFoodRecognitionAvailable(): Promise<boolean> {
    try {
        // Try a test call to see if the function is deployed
        const { error } = await supabase.functions.invoke('recognize-food', {
            body: { imageUrl: 'test' },
        });

        // If we get a response (even an error), the function exists
        return true;
    } catch (error) {
        console.error('Food recognition not available:', error);
        return false;
    }
}
