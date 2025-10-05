'use client';

import { useState, useEffect, ReactNode } from 'react';

interface ClientOnlyProps {
	children: ReactNode;
	fallback?: ReactNode;
}

/**
 * Component that only renders its children on the client side
 * This prevents hydration mismatches for components that use browser APIs
 */
export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
	const [hasMounted, setHasMounted] = useState(false);

	useEffect(() => {
		setHasMounted(true);
	}, []);

	if (!hasMounted) {
		return <>{fallback}</>;
	}

	return <>{children}</>;
}
