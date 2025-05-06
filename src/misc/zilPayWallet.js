import {
  getWalletConnectConnector,
} from '@rainbow-me/rainbowkit';
import { hasInjectedProvider, getInjectedConnector } from './connector';


export const zilPayWallet = ({
  projectId,
  walletConnectParameters,
}) => {
  const isZilPayInjected = hasInjectedProvider({ flag: 'isZilPay' });
  const shouldUseWalletConnect = !isZilPayInjected;

  const getUri = (uri) => {
    return `zilpay://wc?uri=${encodeURIComponent(uri)}`;
  };

  return {
    id: 'zilpay',
    name: 'ZilPay',
    rdns: 'io.zilpay',
    iconUrl: async () => (await import('../../public/static/zilPayWallet.svg')).default.src,
    iconBackground: '#ffffff',
    installed: isZilPayInjected,
    downloadUrls: {
      android: 'https://play.google.com/store/apps/details?id=com.zilpaymobile',
      ios: 'https://apps.apple.com/app/zilpay/id1547105860',
      mobile: 'https://zilpay.io/',
      qrCode: 'https://zilpay.io/',
      chrome: 'https://chromewebstore.google.com/detail/zilpay/klnaejjgbibmhlephnhpmaofohgkpgkd',
      browserExtension: 'https://zilpay.io/',
    },
    mobile: {
      getUri: shouldUseWalletConnect ? getUri : undefined,
    },
    qrCode: shouldUseWalletConnect
      ? {
          getUri: (uri) => uri,
          instructions: {
            learnMoreUrl: 'https://learn.zilpay.io/',
            steps: [
              {
                description:
                  'Install the ZilPay app on your mobile device.',
                step: 'install',
                title: 'Install ZilPay',
              },
              {
                description:
                  'Create a new wallet or import an existing one.',
                step: 'create',
                title: 'Create or Import Wallet',
              },
              {
                description:
                  'Tap the scan button in the app and scan this QR code.',
                step: 'scan',
                title: 'Scan QR Code',
              },
            ],
          },
        }
      : undefined,
    extension: {
      instructions: {
        learnMoreUrl: 'https://learn.zilpay.io/user-guide/how-to-install-zilpay',
        steps: [
          {
            description:
              'Install the ZilPay extension for your browser.',
            step: 'install',
            title: 'Install ZilPay Extension',
          },
          {
            description:
              'Create a new wallet or import an existing one in the extension.',
            step: 'create',
            title: 'Create or Import Wallet',
          },
          {
            description:
              'Once installed, refresh the page to connect.',
            step: 'refresh',
            title: 'Refresh the page',
          },
        ],
      },
    },
    createConnector: shouldUseWalletConnect
      ? getWalletConnectConnector({
          projectId,
          walletConnectParameters,
        })
      : getInjectedConnector({
          flag: 'isZilPay',
        }),
  };
};

