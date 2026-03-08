import {
    useFonts,
    Figtree_400Regular,
    Figtree_500Medium,
    Figtree_600SemiBold,
    Figtree_700Bold,
    Figtree_800ExtraBold,
    Figtree_900Black,
} from '@expo-google-fonts/figtree';
import {
    DMMono_400Regular,
    DMMono_500Medium,
} from '@expo-google-fonts/dm-mono';

export function useFontLoader(): boolean {
    const [fontsLoaded] = useFonts({
        Figtree_400Regular,
        Figtree_500Medium,
        Figtree_600SemiBold,
        Figtree_700Bold,
        Figtree_800ExtraBold,
        Figtree_900Black,
        DMMono_400Regular,
        DMMono_500Medium,
    });

    return fontsLoaded;
}
