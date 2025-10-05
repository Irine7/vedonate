'use client';

import { ReactNode, useEffect, useState } from 'react';

interface HydrationBoundaryProps {
	children: ReactNode;
	fallback?: ReactNode;
}

/**
 * Component that prevents hydration mismatches by ensuring
 * children are only rendered after hydration is complete
 */
export function HydrationBoundary({
	children,
	fallback = null,
}: HydrationBoundaryProps) {
	const [isHydrated, setIsHydrated] = useState(false);

	useEffect(() => {
		// Mark as hydrated after the first render
		setIsHydrated(true);
	}, []);

	if (!isHydrated) {
		return <>{fallback}</>;
	}

	return <>{children}</>;
}
