'use client';
import dynamic from 'next/dynamic';
import React from 'react';

const TestInterface = dynamic(() => import('./components/TestInterface'), {
	ssr: false,
});

export default function Page() {
	return <TestInterface />;
}
