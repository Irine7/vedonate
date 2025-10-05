'use client';

import {
	Box,
	Flex,
	Heading,
	HStack,
	Spacer,
	IconButton,
} from '@chakra-ui/react';
import Link from 'next/link';

/**
 * Placeholder header component for Suspense fallback
 * This prevents hydration mismatches by providing a consistent server/client structure
 */
export function HeaderPlaceholder() {
	return (
		<Box
			as="header"
			position="fixed"
			top={0}
			left={0}
			right={0}
			zIndex={1000}
			bg="transparent"
			transition="all 0.3s ease"
		>
			<Box maxW="container.xl" mx="auto" px={4}>
				<Flex h={16} alignItems="center" justifyContent="space-between">
					{/* Logo */}
					<Link href="/">
						<Heading
							size="md"
							bgGradient="linear(to-r, blue.400, purple.400)"
							bgClip="text"
							cursor="pointer"
							_hover={{ transform: 'scale(1.05)' }}
							transition="transform 0.2s"
						>
							VeDonate
						</Heading>
					</Link>

					<Spacer />

					{/* Right side controls placeholder */}
					<HStack spacing={4}>
						{/* Theme toggle placeholder */}
						<IconButton
							aria-label="Toggle theme"
							variant="ghost"
							size="sm"
							_hover={{ bg: 'gray.700' }}
							disabled
						>
							☀️
						</IconButton>

						{/* Wallet Button placeholder */}
						<Box
							w="32px"
							h="32px"
							bg="gray.600"
							borderRadius="md"
							opacity={0.5}
						/>

						{/* Mobile menu button placeholder */}
						<IconButton
							aria-label="Open menu"
							variant="ghost"
							size="sm"
							display={{ base: 'flex', md: 'none' }}
							_hover={{ bg: 'gray.700' }}
							disabled
						>
							☰
						</IconButton>
					</HStack>
				</Flex>
			</Box>
		</Box>
	);
}
