// Fix for "Cannot set property ethereum of #<Window> which has only a getter" error
// This error occurs when browser extensions try to override the ethereum property

// Execute immediately to prevent extension conflicts
(function () {
    if (typeof window === 'undefined') return;
    // Store the original ethereum property descriptor
    const originalEthereumDescriptor = Object.getOwnPropertyDescriptor(
        window,
        'ethereum',
    );

    // Store the original ethereum value
    const originalEthereumValue = (window as any).ethereum;

    // If ethereum property exists and is not configurable, make it configurable
    if (
        originalEthereumDescriptor &&
        !originalEthereumDescriptor.configurable
    ) {
        try {
            // Try to redefine the property as configurable
            Object.defineProperty(window, 'ethereum', {
                ...originalEthereumDescriptor,
                configurable: true,
                writable: true,
            });
        } catch (error) {
            console.warn(
                'Could not make ethereum property configurable:',
                error,
            );
        }
    }

    // Add a safe ethereum setter that handles conflicts
    const safeEthereumSetter = (value: any) => {
        try {
            // Check if the property is writable
            const descriptor = Object.getOwnPropertyDescriptor(
                window,
                'ethereum',
            );
            if (descriptor && !descriptor.writable && !descriptor.set) {
                console.warn(
                    'Ethereum property is read-only, skipping assignment',
                );
                return;
            }

            // Try to set the property
            (window as any).ethereum = value;
        } catch (error) {
            console.warn('Could not set ethereum property:', error);
        }
    };

    // Override the ethereum setter if possible
    try {
        // First, try to delete the property if it exists
        try {
            delete (window as any).ethereum;
        } catch (error) {
            // Ignore deletion errors
        }

        // Define a new ethereum property with safe getter/setter
        Object.defineProperty(window, 'ethereum', {
            get: () => {
                try {
                    return (window as any)._ethereum || originalEthereumValue;
                } catch (error) {
                    console.warn('Error accessing ethereum property:', error);
                    return undefined;
                }
            },
            set: (value) => {
                try {
                    (window as any)._ethereum = value;
                    safeEthereumSetter(value);
                } catch (error) {
                    console.warn('Error setting ethereum property:', error);
                }
            },
            configurable: true,
            enumerable: true,
        });
    } catch (error) {
        console.warn('Could not override ethereum property:', error);

        // Fallback: try to make it writable
        try {
            Object.defineProperty(window, 'ethereum', {
                value: originalEthereumValue,
                writable: true,
                configurable: true,
                enumerable: true,
            });
        } catch (fallbackError) {
            console.warn('Fallback ethereum fix failed:', fallbackError);
        }
    }
})();
