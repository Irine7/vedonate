'use client';

import React, { Component, ReactNode } from 'react';
import {
    Box,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    Button,
} from '@chakra-ui/react';
import { isExtensionError } from '@/lib/extension-error-handler';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    isExtensionError: boolean;
}

export class NetworkErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            isExtensionError: false,
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
            isExtensionError: isExtensionError(error),
        };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.warn('NetworkErrorBoundary caught an error:', error, errorInfo);

        // Don't log extension errors as they're usually harmless
        if (!this.state.isExtensionError) {
            console.error(
                'Non-extension error caught by NetworkErrorBoundary:',
                error,
            );
        }
    }

    handleRetry = () => {
        this.setState({
            hasError: false,
            error: null,
            isExtensionError: false,
        });
    };

    render() {
        if (this.state.hasError) {
            // For extension errors, show a minimal error or suppress entirely
            if (this.state.isExtensionError) {
                console.warn(
                    'Extension error suppressed by NetworkErrorBoundary',
                );
                // Return children to continue rendering despite extension error
                return this.props.children;
            }

            // For other errors, show the fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <Box p={4}>
                    <Alert status="warning" borderRadius="md">
                        <AlertIcon />
                        <Box>
                            <AlertTitle>Network Error</AlertTitle>
                            <AlertDescription>
                                A network error occurred. This might be due to
                                connectivity issues or browser extension
                                conflicts.
                                <br />
                                <Button
                                    size="sm"
                                    variant="outline"
                                    mt={2}
                                    onClick={this.handleRetry}
                                >
                                    Retry
                                </Button>
                            </AlertDescription>
                        </Box>
                    </Alert>
                </Box>
            );
        }

        return this.props.children;
    }
}
