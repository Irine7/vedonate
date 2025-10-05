import { NextRequest, NextResponse } from 'next/server';

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ path: string[] }> }
) {
	try {
		const { path } = await params;
		const pathString = path.join('/');
		const avatarUrl = `https://testnet.vet.domains/api/avatar/${pathString}`;

		// Fetch the avatar from the external API
		const response = await fetch(avatarUrl, {
			headers: {
				'User-Agent': 'VeDonate/1.0',
			},
		});

		if (!response.ok) {
			return new NextResponse('Avatar not found', { status: 404 });
		}

		const imageBuffer = await response.arrayBuffer();
		const contentType = response.headers.get('content-type') || 'image/png';

		// Return the image with proper CORS headers
		return new NextResponse(imageBuffer, {
			status: 200,
			headers: {
				'Content-Type': contentType,
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'GET',
				'Access-Control-Allow-Headers': 'Content-Type',
				'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
			},
		});
	} catch (error) {
		console.error('Error fetching avatar:', error);
		return new NextResponse('Internal Server Error', { status: 500 });
	}
}

export async function OPTIONS() {
	return new NextResponse(null, {
		status: 200,
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type',
		},
	});
}
