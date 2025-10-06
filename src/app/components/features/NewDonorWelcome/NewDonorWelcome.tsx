'use client';

import React, { useState } from 'react';
import {
	Box,
	Card,
	CardBody,
	VStack,
	HStack,
	Heading,
	Text,
	Button,
	useColorModeValue,
	Badge,
	Grid,
	GridItem,
	Flex,
	Spacer,
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalCloseButton,
	useDisclosure,
	FormControl,
	FormLabel,
	Input,
	Select,
	NumberInput,
	NumberInputField,
	NumberInputStepper,
	NumberIncrementStepper,
	NumberDecrementStepper,
	useToast,
	Divider,
	Icon,
} from '@chakra-ui/react';
import { useVeDonate } from '@/hooks/useVeDonate';
import { useSafeWallet } from '@/hooks/useSafeWallet';

interface NewDonorWelcomeProps {
	account: string;
}

export function NewDonorWelcome({ account }: NewDonorWelcomeProps) {
	const { registerDonor, addDonation, isLoading, isDeployer, refreshData } =
		useVeDonate();
	const { connection, connect } = useSafeWallet();
	const { isOpen, onOpen, onClose } = useDisclosure();
	const toast = useToast();

	const [donationForm, setDonationForm] = useState({
		donationType: 'blood',
		amount: 450,
		centerId: '',
	});

	const [profileForm, setProfileForm] = useState({
		firstName: '',
		lastName: '',
		email: '',
		phone: '',
	});

	const cardBg = useColorModeValue('white', 'gray.800');
	const textColor = useColorModeValue('gray.800', 'white');
	const subtextColor = useColorModeValue('gray.600', 'gray.300');
	const borderColor = useColorModeValue('gray.200', 'gray.600');

	const formatAddress = (address: string) => {
		if (!address || typeof address !== 'string') {
			return 'N/A';
		}
		return `${address.slice(0, 6)}...${address.slice(-4)}`;
	};

	const handleForceReconnect = async () => {
		try {
			toast({
				title: 'Reconnecting...',
				description: 'Attempting to reconnect to VeChain Thor',
				status: 'info',
				duration: 3000,
				isClosable: true,
				position: 'bottom-left',
			});

			// Force update data
			await refreshData();

			toast({
				title: 'Updated',
				description: 'Connection state updated',
				status: 'success',
				duration: 2000,
				isClosable: true,
				position: 'bottom-left',
			});
		} catch (err) {
			console.error('Force reconnect error:', err);
			toast({
				title: 'Error',
				description: 'Failed to update connection',
				status: 'error',
				duration: 3000,
				isClosable: true,
				position: 'bottom-left',
			});
		}
	};

	const handleDirectVeWorldRegistration = async () => {
		try {
			toast({
				title: 'Direct registration...',
				description: 'Attempting registration via VeWorld API',
				status: 'info',
				duration: 3000,
				isClosable: true,
				position: 'bottom-left',
			});

			// Check availability of various VeWorld APIs
			const vechainApi =
				(window as any).vechain ||
				(window as any).veworldKit ||
				(window as any).veworld;

			if (typeof window !== 'undefined' && vechainApi) {
				console.log(
					'VeChain API found:',
					vechainApi.constructor.name,
					'attempting direct registration...'
				);

				// Diagnose available methods
				console.log('Available VeWorld methods:', {
					sendTransaction: typeof vechainApi.sendTransaction,
					request: typeof vechainApi.request,
					keys: Object.keys(vechainApi),
					constructor: vechainApi.constructor.name,
				});

				// VeWorld Connected App doesn't support direct transactions
				// Instead use VeChain Kit or show instructions
				console.log(
					'VeWorld Connected App detected - redirecting to VeChain Kit method'
				);

				// Always try to use standard method
				// VeChain Kit should be available through useVeDonate hook
				console.log(
					'VeChain Kit should be available through useVeDonate hook, using standard registration method'
				);

				// Use standard registration method via VeChain Kit
				// This will call the regular registerDonor function from useVeDonate
				throw new Error('USE_STANDARD_METHOD');
			} else {
				console.log('Available APIs:', {
					vechain: !!(window as any).vechain,
					veworldKit: !!(window as any).veworldKit,
					veworld: !!(window as any).veworld,
				});
				throw new Error(
					'VeChain API unavailable. Try the standard registration button.'
				);
			}
		} catch (err) {
			console.error('Direct VeWorld registration error:', err);

			// Check if we need to use standard method
			if (err instanceof Error && err.message === 'USE_STANDARD_METHOD') {
				console.log('Redirecting to standard registration method...');

				toast({
					title: 'Switching to standard method',
					description:
						'VeWorld Connected App does not support direct transactions. Using standard registration via VeChain Kit',
					status: 'info',
					duration: 4000,
					isClosable: true,
					position: 'bottom-left',
				});

				// Call standard registration function
				try {
					console.log('Calling standard registerDonor function...');
					await registerDonor();

					toast({
						title: 'Success!',
						description: 'Registration via VeChain Kit was successful',
						status: 'success',
						duration: 3000,
						isClosable: true,
						position: 'bottom-left',
					});

					// Update data after registration
					await refreshData();
					onClose();
					return;
				} catch (standardError) {
					console.error('Standard registration failed:', standardError);

					// Check if this is a gas estimation error
					if (
						standardError instanceof Error &&
						standardError.message.includes('Failed to estimate gas')
					) {
						console.log(
							'Gas estimation failed, but transaction might have succeeded...'
						);

						toast({
							title: 'Registration in progress...',
							description:
								'Transaction sent, but gas estimation failed. This is normal for VeWorld Connected App. Check status in VeWorld.',
							status: 'info',
							duration: 6000,
							isClosable: true,
							position: 'bottom-left',
						});

						// Try to update data after some time
						setTimeout(async () => {
							try {
								await refreshData();
								toast({
									title: 'Checking status...',
									description: 'Updating registration data',
									status: 'info',
									duration: 3000,
									isClosable: true,
									position: 'bottom-left',
								});
							} catch (refreshError) {
								console.log('Refresh failed:', refreshError);
							}
						}, 5000);

						onClose();
						return;
					}

					toast({
						title: 'Standard registration error',
						description: `Failed to register via VeChain Kit: ${
							standardError instanceof Error
								? standardError.message
								: 'Unknown error'
						}`,
						status: 'error',
						duration: 5000,
						isClosable: true,
						position: 'bottom-left',
					});
					return;
				}
			}

			toast({
				title: 'Error',
				description: `Failed to register via VeWorld: ${
					err instanceof Error ? err.message : 'Unknown error'
				}`,
				status: 'error',
				duration: 5000,
				isClosable: true,
				position: 'bottom-left',
			});
		}
	};

	const handleAddDonation = async () => {
		// Check profile fields
		if (!profileForm.firstName.trim() || !profileForm.lastName.trim()) {
			toast({
				title: 'Error',
				description: 'Please fill in first and last name',
				status: 'error',
				duration: 3000,
				isClosable: true,
				position: 'bottom-left',
			});
			return;
		}

		if (!donationForm.centerId.trim()) {
			toast({
				title: 'Error',
				description: 'Please specify the donation center ID',
				status: 'error',
				duration: 3000,
				isClosable: true,
				position: 'bottom-left',
			});
			return;
		}

		try {
			// First register user as donor
			await registerDonor();

			// Save user profile to localStorage
			const userProfile = {
				firstName: profileForm.firstName,
				lastName: profileForm.lastName,
				email: profileForm.email,
				phone: profileForm.phone,
				address: account,
				registeredAt: new Date().toISOString(),
			};
			localStorage.setItem(
				`userProfile_${account}`,
				JSON.stringify(userProfile)
			);

			toast({
				title: 'Registration successful!',
				description: `${profileForm.firstName} ${profileForm.lastName}, you are registered as a donor!`,
				status: 'success',
				duration: 3000,
				isClosable: true,
				position: 'bottom-left',
			});

			// If user is deployer, add donation
			if (isDeployer) {
				await addDonation(
					account,
					donationForm.donationType,
					donationForm.amount,
					donationForm.centerId
				);
				toast({
					title: 'Success!',
					description: 'Your donation has been registered!',
					status: 'success',
					duration: 5000,
					isClosable: true,
					position: 'bottom-left',
				});
			} else {
				// For regular users show message that donation will be added by administrator
				toast({
					title: 'Donation sent for verification',
					description:
						'Your donation will be verified and added by an administrator.',
					status: 'info',
					duration: 5000,
					isClosable: true,
					position: 'bottom-left',
				});
			}

			onClose();
			// Reset form
			setDonationForm({
				donationType: 'blood',
				amount: 450,
				centerId: '',
			});
			setProfileForm({
				firstName: '',
				lastName: '',
				email: '',
				phone: '',
			});
		} catch (err) {
			console.error('Registration error:', err);
			toast({
				title: 'Registration error',
				description: err instanceof Error ? err.message : 'Unknown error',
				status: 'error',
				duration: 8000,
				isClosable: true,
				position: 'bottom-left',
			});
		}
	};

	return (
		<VStack spacing={6} align="stretch" mt={820}>
			{/* Welcome for new donor */}
			<Card bg={cardBg} shadow="lg" borderColor="blue.200" borderWidth="1px">
				<CardBody p={8}>
					<VStack spacing={6} textAlign="center">
						<VStack spacing={3}>
							<Heading color={textColor}>Welcome to VeDonate!</Heading>
							<Text fontSize="lg" color={subtextColor} maxW="2xl">
								You are not yet registered as a donor
							</Text>
						</VStack>
					</VStack>
				</CardBody>
			</Card>

			{/* Information on how to become a donor */}
			<Card bg={cardBg} shadow="lg">
				<CardBody p={6}>
					<VStack spacing={6}>
						<Heading size="lg" color={textColor} textAlign="center">
							How to become a donor?
						</Heading>

						<Grid
							templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }}
							gap={6}
							w="full"
						>
							<GridItem>
								<Card bg="gray.50" borderWidth="1px" borderColor={borderColor}>
									<CardBody p={6}>
										<VStack spacing={4} textAlign="center">
											<Text fontSize="4xl">🏥</Text>
											<Heading size="md" color="black">
												1. Visit donation center
											</Heading>
											<Text fontSize="sm" color="black">
												Find the nearest blood donation center and schedule an
												appointment
											</Text>
										</VStack>
									</CardBody>
								</Card>
							</GridItem>

							<GridItem>
								<Card bg="gray.50" borderWidth="1px" borderColor={borderColor}>
									<CardBody p={6}>
										<VStack spacing={4} textAlign="center">
											<Text fontSize="4xl">📝</Text>
											<Heading size="md" color="black">
												2. Register donation
											</Heading>
											<Text fontSize="sm" color="black">
												After donation use the "Add Donation" button to register
											</Text>
										</VStack>
									</CardBody>
								</Card>
							</GridItem>

							<GridItem>
								<Card bg="gray.50" borderWidth="1px" borderColor={borderColor}>
									<CardBody p={6}>
										<VStack spacing={4} textAlign="center">
											<Text fontSize="4xl">🪙</Text>
											<Heading size="md" color="black">
												3. Earn B3TR tokens
											</Heading>
											<Text fontSize="sm" color="black">
												For each registered donation you will receive B3TR
												tokens
											</Text>
										</VStack>
									</CardBody>
								</Card>
							</GridItem>

							<GridItem>
								<Card bg="gray.50" borderWidth="1px" borderColor={borderColor}>
									<CardBody p={6}>
										<VStack spacing={4} textAlign="center">
											<Text fontSize="4xl">🏆</Text>
											<Heading size="md" color="black">
												4. Collect NFT badges
											</Heading>
											<Text fontSize="sm" color="black">
												Reach new levels and earn unique NFT badges
											</Text>
										</VStack>
									</CardBody>
								</Card>
							</GridItem>
						</Grid>
					</VStack>
				</CardBody>
			</Card>

			{/* Donation benefits */}
			<Card bg={cardBg} shadow="lg">
				<CardBody p={6}>
					<VStack spacing={6}>
						<Heading size="lg" color={textColor} textAlign="center">
							✨ Donation Benefits
						</Heading>

						<Grid
							templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }}
							gap={4}
							w="full"
						>
							<VStack spacing={3} p={4} bg="red.50" borderRadius="md">
								<Text fontSize="3xl">❤️</Text>
								<Text fontWeight="bold" color="black" textAlign="center">
									Saving Lives
								</Text>
								<Text fontSize="sm" color="black" textAlign="center">
									Each donation can save up to 3 lives
								</Text>
							</VStack>

							<VStack spacing={3} p={4} bg="orange.50" borderRadius="md">
								<Text fontSize="3xl">💰</Text>
								<Text fontWeight="bold" color="black" textAlign="center">
									B3TR Tokens
								</Text>
								<Text fontSize="sm" color="black" textAlign="center">
									Earn tokens for each donation
								</Text>
							</VStack>

							<VStack spacing={3} p={4} bg="purple.50" borderRadius="md">
								<Text fontSize="3xl">🎖️</Text>
								<Text fontWeight="bold" color="black" textAlign="center">
									NFT Badges
								</Text>
								<Text fontSize="sm" color="black" textAlign="center">
									Collect unique achievements
								</Text>
							</VStack>
						</Grid>
					</VStack>
				</CardBody>
			</Card>

			{/* Platform statistics */}
			<Card bg={cardBg} shadow="lg">
				<CardBody p={6}>
					<VStack spacing={4}>
						<Heading size="md" color={textColor} textAlign="center">
							📊 Platform Statistics
						</Heading>

						<Grid
							templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }}
							gap={4}
							w="full"
						>
							<VStack spacing={2} p={3} bg="blue.50" borderRadius="md">
								<Text fontSize="2xl" fontWeight="bold" color="blue.500">
									1,247
								</Text>
								<Text fontSize="sm" color="black" textAlign="center">
									Active Donors
								</Text>
							</VStack>

							<VStack spacing={2} p={3} bg="green.50" borderRadius="md">
								<Text fontSize="2xl" fontWeight="bold" color="green.500">
									15,892
								</Text>
								<Text fontSize="sm" color="black" textAlign="center">
									Total Donations
								</Text>
							</VStack>

							<VStack spacing={2} p={3} bg="orange.50" borderRadius="md">
								<Text fontSize="2xl" fontWeight="bold" color="orange.500">
									2,847,350
								</Text>
								<Text fontSize="sm" color="black" textAlign="center">
									B3TR Distributed
								</Text>
							</VStack>

							<VStack spacing={2} p={3} bg="red.50" borderRadius="md">
								<Text fontSize="2xl" fontWeight="bold" color="red.500">
									47,676
								</Text>
								<Text fontSize="sm" color="black" textAlign="center">
									Lives Saved
								</Text>
							</VStack>
						</Grid>
					</VStack>
				</CardBody>
			</Card>

			{/* Call to action */}
			<Card bg="linear(to-r, orange.400, red.400)" shadow="xl">
				<CardBody p={8}>
					<VStack spacing={6} textAlign="center">
						<Text fontSize="4xl" color="white">
							🚀
						</Text>
						<Heading size="lg" color="white">
							Ready to start?
						</Heading>
						<Text color="whiteAlpha.900" maxW="lg">
							Join the VeDonate donor community and start saving lives today!
						</Text>
						<Button
							size="lg"
							bg="white"
							color="orange.500"
							_hover={{ bg: 'whiteAlpha.900' }}
							onClick={onOpen}
							isLoading={isLoading}
							loadingText="Registration..."
						>
							🩸 Register as a donor
						</Button>
					</VStack>
				</CardBody>
			</Card>

			{/* Registration Modal */}
			<Modal isOpen={isOpen} onClose={onClose} size="lg">
				<ModalOverlay />
				<ModalContent>
					<ModalHeader>🩸 Donor registration</ModalHeader>
					<ModalCloseButton />
					<ModalBody pb={6}>
						<VStack spacing={4}>
							{/* Connection indicator */}
							<VStack spacing={2} w="full">
								<HStack spacing={2} w="full" justify="center">
									<Icon color={connection?.thor ? 'green.500' : 'red.500'}>
										{connection?.thor ? '🟢' : '🔴'}
									</Icon>
									<Text
										fontSize="sm"
										color={connection?.thor ? 'green.500' : 'red.500'}
									>
										{connection?.thor
											? 'Connected to VeChain Thor'
											: 'Not connected to VeChain Thor'}
									</Text>
								</HStack>
								<Text fontSize="xs" color="gray.500" textAlign="center">
									Network: {connection?.network?.type || 'Loading...'} | Chain
									ID: {connection?.network?.chainId || 'Loading...'}
								</Text>
								{!connection?.network?.type && (
									<Text fontSize="xs" color="blue.500" textAlign="center">
										ℹ️ Network information is loading, registration is still
										possible
									</Text>
								)}
								{!connection?.thor && (
									<Text fontSize="xs" color="orange.500" textAlign="center">
										⚠️ Thor is not connected. The system will attempt to
										initialize it automatically during registration (may take up
										to 30 seconds)
									</Text>
								)}
								{connection?.network?.type &&
									connection?.network?.type !== 'test' && (
										<Text fontSize="xs" color="red.500" textAlign="center">
											❌ VeChain Testnet required
										</Text>
									)}
							</VStack>

							{/* Profile fields */}
							<Text fontWeight="bold" color={textColor} alignSelf="start">
								Personal information
							</Text>

							<HStack spacing={4} w="full">
								<FormControl>
									<FormLabel>First name *</FormLabel>
									<Input
										value={profileForm.firstName}
										onChange={(e) =>
											setProfileForm({
												...profileForm,
												firstName: e.target.value,
											})
										}
										placeholder="Enter first name"
									/>
								</FormControl>

								<FormControl>
									<FormLabel>Last name *</FormLabel>
									<Input
										value={profileForm.lastName}
										onChange={(e) =>
											setProfileForm({
												...profileForm,
												lastName: e.target.value,
											})
										}
										placeholder="Enter last name"
									/>
								</FormControl>
							</HStack>

							<HStack spacing={4} w="full">
								<FormControl>
									<FormLabel>Email</FormLabel>
									<Input
										type="email"
										value={profileForm.email}
										onChange={(e) =>
											setProfileForm({
												...profileForm,
												email: e.target.value,
											})
										}
										placeholder="example@email.com"
									/>
								</FormControl>

								<FormControl>
									<FormLabel>Phone</FormLabel>
									<Input
										value={profileForm.phone}
										onChange={(e) =>
											setProfileForm({
												...profileForm,
												phone: e.target.value,
											})
										}
										placeholder="+34 (999) 123-45-67"
									/>
								</FormControl>
							</HStack>

							<Divider />

							<Text fontWeight="bold" color={textColor} alignSelf="start">
								Donation information
							</Text>

							<FormControl>
								<FormLabel>Donation type</FormLabel>
								<Select
									value={donationForm.donationType}
									onChange={(e) =>
										setDonationForm({
											...donationForm,
											donationType: e.target.value,
										})
									}
								>
									<option value="blood">Blood</option>
									<option value="plasma">Plasma</option>
									<option value="platelets">Platelets</option>
									<option value="bone_marrow">Bone marrow</option>
								</Select>
							</FormControl>

							<FormControl>
								<FormLabel>Volume (ml)</FormLabel>
								<NumberInput
									value={donationForm.amount}
									onChange={(_, value) =>
										setDonationForm({ ...donationForm, amount: value })
									}
									min={50}
									max={1000}
								>
									<NumberInputField />
									<NumberInputStepper>
										<NumberIncrementStepper />
										<NumberDecrementStepper />
									</NumberInputStepper>
								</NumberInput>
							</FormControl>

							{/* <FormControl>
								<FormLabel>Donation center ID</FormLabel>
								<Input
									value={donationForm.centerId}
									onChange={(e) =>
										setDonationForm({
											...donationForm,
											centerId: e.target.value,
										})
									}
									placeholder="Enter donation center ID"
								/>
							</FormControl> */}

							<VStack spacing={4} w="full">
								<Button
									colorScheme="blue"
									variant="outline"
									onClick={handleForceReconnect}
									size="sm"
									w="full"
									isDisabled={isLoading}
								>
									🔄 Reconnect Thor
								</Button>
								<Button
									colorScheme="green"
									variant="outline"
									onClick={handleDirectVeWorldRegistration}
									size="sm"
									w="full"
									isDisabled={isLoading}
								>
									🚀 Smart registration (VeWorld/VeChain Kit)
								</Button>
								<HStack spacing={4} w="full">
									<Button variant="ghost" onClick={onClose} flex={1}>
										Cancel
									</Button>
								</HStack>
							</VStack>
						</VStack>
					</ModalBody>
				</ModalContent>
			</Modal>
		</VStack>
	);
}
