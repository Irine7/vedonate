const basePath = process.env.BASE_PATH ?? '';

/** @type {import('next').NextConfig} */
const nextConfig = {
	basePath,
	assetPrefix: basePath,
	// Remove 'export' output to enable API routes
	// output: 'export',
	distDir: 'dist',

	// Performance optimizations
	compiler: {
		// Enable SWC minifier for faster builds
		removeConsole:
			process.env.NODE_ENV === 'production'
				? {
						exclude: ['error', 'warn'],
				  }
				: false,
	},

	// Enable stable Turbopack features
	turbopack: {
		resolveAlias: {
			// Optimize imports
			'@/*': './src/*',
		},
	},

	// Enable experimental features for better performance (safe ones only)
	experimental: {
		// Enable modern webpack features
		webpackBuildWorker: true,
		// Better bundling
		optimizePackageImports: ['@chakra-ui/react', '@vechain/vechain-kit'],
	},

	// Webpack optimizations
	webpack: (config, { buildId, dev, isServer, webpack }) => {
		// Add fallback for Node.js modules in browser
		config.resolve.fallback = {
			...config.resolve.fallback,
			fs: false,
			net: false,
			tls: false,
			crypto: false,
		};

		// Optimize bundle splitting
		if (!dev && !isServer) {
			config.optimization.splitChunks = {
				...config.optimization.splitChunks,
				cacheGroups: {
					...config.optimization.splitChunks.cacheGroups,
					// Separate chunk for large dependencies
					vendor: {
						test: /[\\/]node_modules[\\/]/,
						name: 'vendors',
						chunks: 'all',
						enforce: true,
					},
					// Separate chunk for VeChain Kit
					vechain: {
						test: /[\\/]node_modules[\\/]@vechain[\\/]/,
						name: 'vechain',
						chunks: 'all',
						priority: 10,
					},
				},
			};
		}

		// Faster builds with cached builds
		if (!dev) {
			config.cache = {
				type: 'filesystem',
				buildDependencies: {
					config: [__filename],
				},
			};
		}

		return config;
	},

	images: {
		unoptimized: true,
	},
	env: {
		basePath,
	},
	eslint: {
		// Warning: This allows production builds to successfully complete even if
		// your project has ESLint errors.
		ignoreDuringBuilds: true,
	},
	typescript: {
		// !! WARN !!
		// Dangerously allow production builds to successfully complete even if
		// your project has type errors.
		ignoreBuildErrors: true,
	},

	// Enable build time optimizations
	poweredByHeader: false,
	generateEtags: false,
};

module.exports = nextConfig;
