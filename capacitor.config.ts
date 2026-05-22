import { CapacitorConfig } from '@capacitor/cli'

const serverUrl = process.env.CAPACITOR_SERVER_URL

const config: CapacitorConfig = {
  appId: 'com.catalyxlabs.growos',
  appName: 'Catalyx Labs',
  webDir: 'mobile-shell',
  server: {
    ...(serverUrl ? { url: serverUrl, cleartext: false } : {}),
    androidScheme: 'https',
    iosScheme: 'https',
  },
}

export default config
