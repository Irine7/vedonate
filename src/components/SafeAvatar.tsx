'use client';

import { useState, useEffect } from 'react';
import { Image, ImageProps } from '@chakra-ui/react';
import { loadAvatar, getFallbackAvatarUrl } from '@/lib/avatar-utils';

interface SafeAvatarProps extends Omit<ImageProps, 'src'> {
	domain: string;
	fallbackSrc?: string;
}

export function SafeAvatar({ domain, fallbackSrc, ...props }: SafeAvatarProps) {
	const [avatarSrc, setAvatarSrc] = useState<string>(
		fallbackSrc || getFallbackAvatarUrl()
	);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		let isMounted = true;

		const loadAvatarAsync = async () => {
			try {
				setIsLoading(true);
				const src = await loadAvatar(domain);

				if (isMounted) {
					setAvatarSrc(src);
				}
			} catch (error) {
				console.warn(`Error loading avatar for ${domain}:`, error);
				if (isMounted) {
					setAvatarSrc(fallbackSrc || getFallbackAvatarUrl());
				}
			} finally {
				if (isMounted) {
					setIsLoading(false);
				}
			}
		};

		loadAvatarAsync();

		return () => {
			isMounted = false;
		};
	}, [domain, fallbackSrc]);

	return (
		<Image
			src={avatarSrc}
			alt={`Avatar for ${domain}`}
			loading="lazy"
			onError={() => {
				setAvatarSrc(fallbackSrc || getFallbackAvatarUrl());
				setIsLoading(false);
			}}
			{...props}
		/>
	);
}
