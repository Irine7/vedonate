'use client';

import { type ReactElement } from 'react';
import {
	Box,
	Flex,
	Heading,
	HStack,
	Spacer,
	Button,
	IconButton,
	Menu,
	MenuButton,
	MenuItem,
	MenuList,
	useDisclosure,
	Drawer,
	DrawerBody,
	DrawerCloseButton,
	DrawerContent,
	DrawerHeader,
	DrawerOverlay,
	VStack,
	Divider,
	Text,
	Image,
} from '@chakra-ui/react';
// Custom icons as simple text/symbols
import { useWallet, WalletButton } from '@vechain/vechain-kit';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ThemeToggle } from '@/app/components/features/ThemeToggle';
import { LanguageSelector } from '@/app/components/features/LanguageSelector';

// Safe wrapper for wallet functionality
function WalletSection(): ReactElement {
	try {
		const { account } = useWallet();
		return (
			<>
				{/* Wallet Button */}
				<WalletButton
					mobileVariant="iconOnly"
					desktopVariant="iconDomainAndAssets"
				/>

				{/* Mobile wallet status */}
				{/* {account && (
					<>
						<Box p={4} bg="gray.800" borderRadius="md">
							<Text fontSize="sm" color="gray.400" mb={2}>
								Connected Account
							</Text>
							<Text fontFamily="mono" fontSize="xs" wordBreak="break-all">
								{account.address}
							</Text>
						</Box>
						<Divider />
					</>
				)} */}
			</>
		);
	} catch (error) {
		// Wallet provider not available yet
		return <></>;
	}
}

export function Header(): ReactElement {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [isScrolled, setIsScrolled] = useState(false);

	// Handle scroll effect
	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 10);
		};

		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	const navItems = [
		{ label: 'Home', href: '/' },
		{ label: 'Test', href: '/test' },
	];

	return (
		<>
			<Box
				as="header"
				position="fixed"
				top={0}
				left={0}
				right={0}
				zIndex={1000}
				bg={isScrolled ? 'rgba(26, 32, 44, 0.95)' : 'transparent'}
				backdropFilter={isScrolled ? 'blur(10px)' : 'none'}
				borderBottom={isScrolled ? '1px solid' : 'none'}
				borderColor="gray.700"
				transition="all 0.3s ease"
			>
				<Box maxW="container.xl" mx="auto" px={4}>
					<Flex h={16} alignItems="center" justifyContent="space-between">
						{/* Logo */}
						<Link href="/">
							<HStack
								spacing={2}
								cursor="pointer"
								_hover={{ transform: 'scale(1.05)' }}
								transition="transform 0.2s"
							>
								<Image
									src="/logo.png"
									alt="VeDonate Logo"
									height="32px"
									width="32px"
									objectFit="contain"
								/>
								<Heading
									size="md"
									bgGradient="linear(to-r, orange.400, red.400)"
									bgClip="text"
								>
									VeDonate
								</Heading>
							</HStack>
						</Link>

						{/* Desktop Navigation */}
						<HStack spacing={8} display={{ base: 'none', md: 'flex' }}>
							{navItems.map((item) => (
								<Link key={item.href} href={item.href}>
									<Button
										variant="ghost"
										size="sm"
										_hover={{ bg: 'gray.700', transform: 'translateY(-1px)' }}
										transition="all 0.2s"
									>
										{item.label}
									</Button>
								</Link>
							))}
						</HStack>

						<Spacer />

						{/* Right side controls */}
						<HStack spacing={4}>
							{/* Language selector */}
							<LanguageSelector />

							{/* Theme toggle */}
							<ThemeToggle />

							{/* Wallet Button */}
							<WalletSection />

							{/* Mobile menu button */}
							<IconButton
								aria-label="Open menu"
								onClick={onOpen}
								variant="ghost"
								size="sm"
								display={{ base: 'flex', md: 'none' }}
								_hover={{ bg: 'gray.700' }}
							>
								☰
							</IconButton>
						</HStack>
					</Flex>
				</Box>
			</Box>

			{/* Mobile Drawer */}
			<Drawer isOpen={isOpen} placement="right" onClose={onClose}>
				<DrawerOverlay />
				<DrawerContent>
					<DrawerCloseButton />
					<DrawerHeader>
						<HStack spacing={2}>
							<Image
								src="/logo.png"
								alt="VeDonate Logo"
								height="30px"
								width="30px"
								objectFit="contain"
							/>
							<Heading
								size="md"
								bgGradient="linear(to-r, orange.400, red.400)"
								bgClip="text"
							>
								VeDonate
							</Heading>
						</HStack>
					</DrawerHeader>

					<DrawerBody>
						<VStack spacing={4} align="stretch">
							{/* Wallet Status */}
							<WalletSection />

							{/* Navigation Links */}
							{navItems.map((item) => (
								<Link key={item.href} href={item.href} onClick={onClose}>
									<Button
										variant="ghost"
										size="lg"
										w="full"
										justifyContent="flex-start"
										_hover={{ bg: 'gray.700' }}
									>
										{item.label}
									</Button>
								</Link>
							))}

							{/* <Divider /> */}

							{/* Theme Toggle */}
							<Box onClick={onClose}>
								<ThemeToggle />
							</Box>

							{/* Language Selector */}
							<Box onClick={onClose}>
								<LanguageSelector />
							</Box>
						</VStack>
					</DrawerBody>
				</DrawerContent>
			</Drawer>
		</>
	);
}
