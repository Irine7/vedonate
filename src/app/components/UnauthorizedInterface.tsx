'use client';

import React from 'react';
import {
	Box,
	Container,
	VStack,
	HStack,
	Heading,
	Text,
	Button,
	Grid,
	GridItem,
	Icon,
	Card,
	CardBody,
	Divider,
	useColorModeValue,
	Flex,
	Badge,
} from '@chakra-ui/react';
import { WalletButton } from '@vechain/vechain-kit';

interface FeatureCardProps {
	icon: string;
	title: string;
	description: string;
	color: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
	icon,
	title,
	description,
	color,
}) => {
	const cardBg = useColorModeValue('white', 'gray.800');
	const borderColor = useColorModeValue('gray.200', 'gray.600');

	return (
		<Box role="group">
			<Card
				bg={cardBg}
				borderColor={borderColor}
				borderWidth="1px"
				height="100%"
				_hover={{
					transform: 'translateY(-8px)',
					shadow: 'xl',
					borderColor: `${color}.400`,
				}}
				transition="all 0.3s ease"
				cursor="pointer"
			>
				<CardBody p={6}>
					<VStack align="start" spacing={4} height="100%">
						<Box
							p={3}
							bg={`${color}.100`}
							borderRadius="full"
							color={`${color}.600`}
							fontSize="2xl"
							transition="all 0.3s ease"
							_groupHover={{
								bg: `${color}.200`,
								transform: 'scale(1.1)',
							}}
						>
							{icon}
						</Box>
						<Heading size="md" color={useColorModeValue('gray.800', 'white')}>
							{title}
						</Heading>
						<Text
							color={useColorModeValue('gray.600', 'gray.300')}
							flex="1"
							lineHeight="tall"
						>
							{description}
						</Text>
					</VStack>
				</CardBody>
			</Card>
		</Box>
	);
};

const UnauthorizedInterface: React.FC = () => {
	const bgGradient = useColorModeValue(
		'linear(to-br, orange.50, red.50, pink.50)',
		'linear(to-br, gray.900, gray.800, gray.900)'
	);
	const heroBg = useColorModeValue('white', 'gray.800');
	const textColor = useColorModeValue('gray.800', 'white');
	const subtextColor = useColorModeValue('gray.600', 'gray.300');

	const features = [
		{
			icon: '🩸',
			title: 'Донорство крови',
			description:
				'Записывайтесь на донации крови и получайте токены B3TR за каждую донацию',
			color: 'red',
		},
		{
			icon: '💎',
			title: 'NFT бейджи',
			description: 'Получайте уникальные NFT бейджи за достижения в донорстве',
			color: 'purple',
		},
		{
			icon: '📊',
			title: 'Статистика',
			description:
				'Отслеживайте свою историю донаций и достижения в личном кабинете',
			color: 'blue',
		},
		{
			icon: '🌐',
			title: 'Децентрализация',
			description:
				'Все данные хранятся в блокчейне VeChain, обеспечивая прозрачность',
			color: 'green',
		},
	];

	const stats = [
		{ label: 'Активных доноров', value: '1,234' },
		{ label: 'Спасенных жизней', value: '5,678' },
		{ label: 'B3TR токенов распределено', value: '89,012' },
		{ label: 'Донаций зарегистрировано', value: '12,345' },
	];

	return (
		<Box minH="100vh" bg={bgGradient}>
			{/* Hero Section */}
			<Container maxW="container.xl">
				<VStack spacing={12} align="center">
					{/* Main Hero */}
					<VStack spacing={6} textAlign="center" maxW="4xl" mt={824}>
						<Badge
							colorScheme="orange"
							variant="subtle"
							px={4}
							py={2}
							borderRadius="full"
							fontSize="sm"
						>
							🩸 Децентрализованная платформа донорства
						</Badge>

						<Heading
							size="2xl"
							bgGradient="linear(to-r, orange.400, red.400, pink.400)"
							bgClip="text"
							fontWeight="bold"
						>
							VeDonate
						</Heading>

						<Text
							fontSize="xl"
							color={subtextColor}
							maxW="2xl"
							lineHeight="tall"
						>
							Присоединяйтесь к революции в донорстве крови. Получайте токены
							B3TR за каждую донацию, коллекционируйте NFT бейджи и спасайте
							жизни с помощью блокчейн технологий.
						</Text>
					</VStack>

					{/* Stats Section */}
					{/* <Card bg={heroBg} shadow="xl" borderRadius="2xl" w="full" maxW="4xl">
						<CardBody p={8}>
							<Grid
								templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }}
								gap={6}
							>
								{stats.map((stat, index) => (
									<GridItem key={index}>
										<VStack spacing={2}>
											<Text
												fontSize="3xl"
												fontWeight="bold"
												bgGradient="linear(to-r, orange.400, red.400)"
												bgClip="text"
											>
												{stat.value}
											</Text>
											<Text
												color={subtextColor}
												textAlign="center"
												fontSize="sm"
												fontWeight="medium"
											>
												{stat.label}
											</Text>
										</VStack>
									</GridItem>
								))}
							</Grid>
						</CardBody>
					</Card> */}
				</VStack>
			</Container>

			{/* Features Section */}
			<Container maxW="container.xl" py={16}>
				<VStack spacing={12}>
					<VStack spacing={4} textAlign="center">
						<Heading size="xl" color={textColor}>
							Почему выбирают VeDonate?
						</Heading>
						<Text color={subtextColor} maxW="2xl" fontSize="lg">
							Современная платформа объединяет традиционное донорство с
							инновационными блокчейн технологиями
						</Text>
					</VStack>

					<Grid
						templateColumns={{
							base: '1fr',
							md: 'repeat(2, 1fr)',
							lg: 'repeat(4, 1fr)',
						}}
						gap={6}
						w="full"
					>
						{features.map((feature, index) => (
							<GridItem key={index}>
								<FeatureCard {...feature} />
							</GridItem>
						))}
					</Grid>
				</VStack>
			</Container>

			{/* CTA Section */}
			<Container maxW="container.xl" py={16}>
				<Card
					bgGradient="linear(to-r, orange.400, red.400, pink.400)"
					shadow="xl"
					borderRadius="2xl"
				>
					<CardBody p={12} textAlign="center">
						<VStack spacing={6}>
							<Heading size="xl" color="white">
								Готовы начать спасать жизни?
							</Heading>
							<Text color="whiteAlpha.900" fontSize="lg" maxW="2xl">
								Подключите свой VeWorld кошелек и присоединяйтесь к сообществу
								доноров, которые меняют мир к лучшему
							</Text>
							<WalletButton
								size="lg"
								bg="white"
								color="orange.500"
								_hover={{
									bg: 'gray.50',
									transform: 'translateY(-2px)',
								}}
								transition="all 0.2s"
								px={12}
								py={6}
								fontSize="lg"
								fontWeight="bold"
								mobileVariant="fullWidth"
								desktopVariant="fullWidth"
							/>
						</VStack>
					</CardBody>
				</Card>
			</Container>

			{/* Footer Info */}
			<Container maxW="container.xl" py={8}>
				<Divider mb={8} />
				<VStack spacing={4} textAlign="center">
					<Text color={subtextColor} fontSize="sm">
						🌐 Построено на блокчейне VeChain • 🔒 Безопасно и децентрализовано
					</Text>
					<Text color={subtextColor} fontSize="xs">
						VeDonate использует смарт-контракты для обеспечения прозрачности и
						безопасности всех операций
					</Text>
				</VStack>
			</Container>
		</Box>
	);
};

export default UnauthorizedInterface;
