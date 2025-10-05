'use client';

import React, { useState } from 'react';
import { useVeDonate } from '@/hooks/useVeDonate';
import { useWallet } from '@vechain/vechain-kit';
import { BadgeType } from '@/lib/contracts';

interface TestDonationForm {
	donor: string;
	type: string;
	amount: number;
	centerId: string;
}

export default function TestInterface() {
	const { account, connection } = useWallet();
	const {
		donorInfo,
		donorDonations,
		donorBadges,
		globalStats,
		b3trBalance,
		isLoading,
		error,
		registerDonor,
		addDonation,
		refreshData,
		getBadgeName,
		getBadgeRequirement,
		getBadgeIcon,
		isDeployer,
	} = useVeDonate();

	const [testForm, setTestForm] = useState<TestDonationForm>({
		donor: account || '',
		type: 'кровь',
		amount: 500,
		centerId: 'center_001',
	});

	const [testResults, setTestResults] = useState<string[]>([]);

	const addTestResult = (message: string) => {
		setTestResults((prev) => [
			...prev,
			`${new Date().toLocaleTimeString()}: ${message}`,
		]);
	};

	const handleRegisterDonor = async () => {
		try {
			addTestResult('Начинаем регистрацию донора...');
			await registerDonor();
			addTestResult('✅ Донор успешно зарегистрирован!');
		} catch (err) {
			addTestResult(`❌ Ошибка регистрации: ${err}`);
		}
	};

	const handleAddDonation = async () => {
		try {
			addTestResult('Добавляем донацию...');
			await addDonation(
				testForm.donor,
				testForm.type,
				testForm.amount,
				testForm.centerId
			);
			addTestResult('✅ Донация успешно добавлена!');
		} catch (err) {
			addTestResult(`❌ Ошибка добавления донации: ${err}`);
		}
	};

	const handleRefresh = async () => {
		try {
			addTestResult('Обновляем данные...');
			await refreshData();
			addTestResult('✅ Данные обновлены!');
		} catch (err) {
			addTestResult(`❌ Ошибка обновления: ${err}`);
		}
	};

	const clearResults = () => {
		setTestResults([]);
	};

	return (
		<div className="max-w-6xl mx-auto p-6 space-y-8">
			{/* Заголовок */}
			<div className="text-center">
				<h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
					🧪 VeDonate Test Interface
				</h1>
				<p className="text-gray-600 dark:text-gray-400">
					Интерфейс для тестирования функциональности VeDonate
				</p>
			</div>

			{/* Статус подключения */}
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
				<h2 className="text-xl font-semibold mb-4">📡 Статус подключения</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="flex items-center space-x-3">
						<div
							className={`w-3 h-3 rounded-full ${
								connection.isConnected ? 'bg-green-500' : 'bg-red-500'
							}`}
						></div>
						<span>
							VeChain подключен: {connection.isConnected ? '✅' : '❌'}
						</span>
					</div>
					<div className="flex items-center space-x-3">
						<div
							className={`w-3 h-3 rounded-full ${
								account ? 'bg-green-500' : 'bg-red-500'
							}`}
						></div>
						<span>Кошелек: {account ? '✅' : '❌'}</span>
					</div>
				</div>
				{account && (
					<div className="mt-3 p-3 bg-gray-100 dark:bg-gray-700 rounded">
						<p className="text-sm font-mono break-all">{account}</p>
						{isDeployer && (
							<span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
								🔑 Деплойер
							</span>
						)}
					</div>
				)}
			</div>

			{/* Глобальная статистика */}
			{globalStats && (
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
					<h2 className="text-xl font-semibold mb-4">
						📊 Глобальная статистика
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
							<div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
								{globalStats.totalDonations.toString()}
							</div>
							<div className="text-sm text-gray-600 dark:text-gray-400">
								Всего донаций
							</div>
						</div>
						<div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
							<div className="text-2xl font-bold text-green-600 dark:text-green-400">
								{globalStats.totalDonors.toString()}
							</div>
							<div className="text-sm text-gray-600 dark:text-gray-400">
								Всего доноров
							</div>
						</div>
						<div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
							<div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
								{globalStats.totalB3TRDistributed.toString()}
							</div>
							<div className="text-sm text-gray-600 dark:text-gray-400">
								B3TR распределено
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Информация о доноре */}
			{donorInfo && (
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
					<h2 className="text-xl font-semibold mb-4">👤 Информация о доноре</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="space-y-3">
							<div className="flex justify-between">
								<span className="text-gray-600 dark:text-gray-400">
									Всего донаций:
								</span>
								<span className="font-semibold">
									{donorInfo.totalDonations.toString()}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-gray-600 dark:text-gray-400">
									Донаций плазмы:
								</span>
								<span className="font-semibold">
									{donorInfo.plasmaDonations.toString()}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-gray-600 dark:text-gray-400">
									Всего B3TR:
								</span>
								<span className="font-semibold">
									{donorInfo.totalB3TR.toString()}
								</span>
							</div>
						</div>
						<div className="space-y-3">
							<div className="flex justify-between">
								<span className="text-gray-600 dark:text-gray-400">
									Текущий баланс B3TR:
								</span>
								<span className="font-semibold text-yellow-600">
									{b3trBalance.toString()}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-gray-600 dark:text-gray-400">
									Последняя донация:
								</span>
								<span className="font-semibold">
									{donorInfo.lastDonation.toString() !== '0'
										? new Date(
												Number(donorInfo.lastDonation) * 1000
										  ).toLocaleDateString()
										: 'Никогда'}
								</span>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Бейджи донора */}
			{donorBadges.length > 0 && (
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
					<h2 className="text-xl font-semibold mb-4">🏆 Бейджи донора</h2>
					<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
						{donorBadges.map((badgeType) => (
							<div
								key={badgeType}
								className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border"
							>
								<div className="text-3xl mb-2">{getBadgeIcon(badgeType)}</div>
								<div className="font-semibold text-sm">
									{getBadgeName(badgeType)}
								</div>
								<div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
									{getBadgeRequirement(badgeType)}
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			{/* История донаций */}
			{donorDonations.length > 0 && (
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
					<h2 className="text-xl font-semibold mb-4">📋 История донаций</h2>
					<div className="space-y-3">
						{donorDonations.map((donation, index) => (
							<div
								key={index}
								className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
							>
								<div className="flex justify-between items-start">
									<div>
										<div className="font-semibold">{donation.donationType}</div>
										<div className="text-sm text-gray-600 dark:text-gray-400">
											{new Date(
												Number(donation.timestamp) * 1000
											).toLocaleString()}
										</div>
										<div className="text-sm">Центр: {donation.centerId}</div>
									</div>
									<div className="text-right">
										<div className="font-semibold">
											{donation.amount.toString()} мл
										</div>
										<div className="text-sm text-yellow-600">
											+{donation.b3trReward.toString()} B3TR
										</div>
										<div
											className={`text-xs px-2 py-1 rounded ${
												donation.verified
													? 'bg-green-100 text-green-800'
													: 'bg-yellow-100 text-yellow-800'
											}`}
										>
											{donation.verified ? '✅ Подтверждено' : '⏳ Ожидает'}
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Панель тестирования */}
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
				<h2 className="text-xl font-semibold mb-4">🧪 Панель тестирования</h2>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Базовые действия */}
					<div className="space-y-4">
						<h3 className="text-lg font-medium">Базовые действия</h3>

						<div className="space-y-3">
							<button
								onClick={handleRegisterDonor}
								disabled={
									isLoading ||
									!connection.isConnected ||
									donorInfo?.isRegistered
								}
								className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
							>
								{isLoading ? '⏳ Загрузка...' : '📝 Зарегистрировать донора'}
							</button>

							<button
								onClick={handleRefresh}
								disabled={isLoading}
								className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
							>
								{isLoading ? '⏳ Загрузка...' : '🔄 Обновить данные'}
							</button>
						</div>
					</div>

					{/* Добавление донации (только для деплойера) */}
					{isDeployer && (
						<div className="space-y-4">
							<h3 className="text-lg font-medium">Добавить донацию</h3>

							<div className="space-y-3">
								<div>
									<label className="block text-sm font-medium mb-1">
										Адрес донора
									</label>
									<input
										type="text"
										value={testForm.donor}
										onChange={(e) =>
											setTestForm((prev) => ({
												...prev,
												donor: e.target.value,
											}))
										}
										className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
										placeholder="0x..."
									/>
								</div>

								<div>
									<label className="block text-sm font-medium mb-1">
										Тип донации
									</label>
									<select
										value={testForm.type}
										onChange={(e) =>
											setTestForm((prev) => ({ ...prev, type: e.target.value }))
										}
										className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
									>
										<option value="кровь">Кровь</option>
										<option value="плазма">Плазма</option>
										<option value="тромбоциты">Тромбоциты</option>
									</select>
								</div>

								<div>
									<label className="block text-sm font-medium mb-1">
										Объем (мл)
									</label>
									<input
										type="number"
										value={testForm.amount}
										onChange={(e) =>
											setTestForm((prev) => ({
												...prev,
												amount: parseInt(e.target.value),
											}))
										}
										className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
										placeholder="500"
									/>
								</div>

								<div>
									<label className="block text-sm font-medium mb-1">
										ID центра
									</label>
									<input
										type="text"
										value={testForm.centerId}
										onChange={(e) =>
											setTestForm((prev) => ({
												...prev,
												centerId: e.target.value,
											}))
										}
										className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
										placeholder="center_001"
									/>
								</div>

								<button
									onClick={handleAddDonation}
									disabled={isLoading || !connection.isConnected}
									className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
								>
									{isLoading ? '⏳ Загрузка...' : '➕ Добавить донацию'}
								</button>
							</div>
						</div>
					)}
				</div>

				{/* Логи тестирования */}
				<div className="mt-6">
					<div className="flex justify-between items-center mb-3">
						<h3 className="text-lg font-medium">📝 Логи тестирования</h3>
						<button
							onClick={clearResults}
							className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
						>
							Очистить
						</button>
					</div>

					<div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
						{testResults.length === 0 ? (
							<div className="text-gray-500">
								Логи появятся здесь после выполнения тестов...
							</div>
						) : (
							testResults.map((result, index) => (
								<div key={index} className="mb-1">
									{result}
								</div>
							))
						)}
					</div>
				</div>

				{/* Ошибки */}
				{error && (
					<div className="mt-4 p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg">
						<div className="flex items-center">
							<div className="text-red-600 dark:text-red-400">❌</div>
							<div className="ml-2 text-red-800 dark:text-red-200">{error}</div>
						</div>
					</div>
				)}
			</div>

			{/* Инструкции */}
			<div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
				<h2 className="text-xl font-semibold mb-4">
					📖 Инструкции по тестированию
				</h2>
				<div className="space-y-3 text-sm">
					<div>
						<strong>1. Подключение:</strong> Убедитесь, что VeWorld Wallet
						подключен к VeChain Testnet
					</div>
					<div>
						<strong>2. Регистрация:</strong> Нажмите "Зарегистрировать донора"
						для создания профиля
					</div>
					<div>
						<strong>3. Добавление донаций:</strong> Только деплойер может
						добавлять донации через форму
					</div>
					<div>
						<strong>4. Мониторинг:</strong> Следите за логами и обновляйте
						данные для просмотра изменений
					</div>
					<div>
						<strong>5. Explorer:</strong> Проверяйте транзакции в{' '}
						<a
							href="https://explore-testnet.vechain.org"
							target="_blank"
							className="text-blue-600 hover:underline"
						>
							VeChain Explorer
						</a>
					</div>
				</div>
			</div>
		</div>
	);
}

