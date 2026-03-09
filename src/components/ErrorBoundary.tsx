import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { Text } from './ui/Text';
import { Button } from './ui/Button';
import { colors } from '@/theme';
import { AlertTriangle } from 'lucide-react-native';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    public render() {
        if (this.state.hasError) {
            return (
                <SafeAreaView style={styles.container}>
                    <View style={styles.content}>
                        <View style={styles.iconContainer}>
                            <AlertTriangle size={48} color={colors.red.DEFAULT} />
                        </View>
                        <Text variant="heading" color={colors.text1} style={styles.title}>
                            Oops! Something went wrong.
                        </Text>
                        <Text variant="body" color={colors.text2} style={styles.message}>
                            We encountered an unexpected error. Don't worry, your data is safe.
                        </Text>
                        <Button
                            title="Try Again"
                            onPress={this.handleReset}
                            style={styles.button}
                        />
                    </View>
                </SafeAreaView>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.red.light,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        textAlign: 'center',
        marginBottom: 12,
    },
    message: {
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 20,
    },
    button: {
        minWidth: 200,
    },
});
