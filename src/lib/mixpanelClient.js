import mixpanel from 'mixpanel-browser';

const MIXPANEL_PROJECT_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN || '';

// Initialize Mixpanel only if token is provided
let isInitialized = false;
if (
    MIXPANEL_PROJECT_TOKEN &&
    MIXPANEL_PROJECT_TOKEN !== 'your_mixpanel_token_here'
) {
    try {
        mixpanel.init(MIXPANEL_PROJECT_TOKEN, {
            debug: process.env.NODE_ENV === 'development',
            track_pageview: false, // Disable automatic page tracking
            persistence: 'localStorage',
        });
        isInitialized = true;
    } catch (error) {
        console.warn('Failed to initialize Mixpanel:', error);
    }
}

// **Core Function to Track Events**
const trackEvent = (event, properties = {}) => {
    if (!isInitialized) {
        console.warn('Mixpanel not initialized. Event not tracked:', event);
        return;
    }

    try {
        mixpanel.track(event, properties);
    } catch (error) {
        console.warn('Failed to track event:', event, error);
    }
};

// **Reset User Data (For Logout)**
const resetUser = () => {
    if (!isInitialized) {
        console.warn('Mixpanel not initialized. Cannot reset user data.');
        return;
    }

    try {
        mixpanel.reset();
    } catch (error) {
        console.warn('Failed to reset Mixpanel user data:', error);
    }
};

// **Identify User (For Login/Registration)**
const identifyUser = (userId, userProperties = {}) => {
    if (!isInitialized) {
        console.warn('Mixpanel not initialized. Cannot identify user.');
        return;
    }

    try {
        mixpanel.identify(userId);
        if (Object.keys(userProperties).length > 0) {
            mixpanel.people.set(userProperties);
        }
    } catch (error) {
        console.warn('Failed to identify user:', error);
    }
};

// **Set User Properties**
const setUserProperties = (properties) => {
    if (!isInitialized) {
        console.warn('Mixpanel not initialized. Cannot set user properties.');
        return;
    }

    try {
        mixpanel.people.set(properties);
    } catch (error) {
        console.warn('Failed to set user properties:', error);
    }
};

// **Check if Mixpanel is initialized**
const isMixpanelReady = () => {
    return isInitialized;
};

// **Exporting All Tracking Methods**
export default {
    trackEvent,
    resetUser,
    identifyUser,
    setUserProperties,
    isMixpanelReady,
};
