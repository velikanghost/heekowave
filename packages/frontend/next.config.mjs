import withSerwistInit from '@serwist/next'

const withSerwist = withSerwistInit({
  // Note: This is only an example. If you use Pages Router,
  // use something else that works, such as "service-worker/index.ts".
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
})

export default withSerwist({
  // Your Next.js config
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Ignore React Native modules in web environment
      config.resolve.fallback = {
        ...config.resolve.fallback,
        '@react-native-async-storage/async-storage': false,
        'react-native': false,
        'react-native-web': false,
        'react-native-crypto': false,
        'react-native-randombytes': false,
        'crypto': false,
        'stream': false,
        'util': false,
        'buffer': false,
        'process': false,
        'os': false,
        'path': false,
        'fs': false,
      }
    }
    return config
  },
})
