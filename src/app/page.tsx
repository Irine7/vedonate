'use client';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import React from 'react';

const Home = dynamic(() => import('./components/pages/Home'), {
	ssr: false,
});

export default function Page() {
	return (
		<>
			<Image src="/logo.png" alt="Logo" width={100} height={100} />
			{/* <Home /> */}
		</>
	);
}
