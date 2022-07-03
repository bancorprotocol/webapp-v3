module.exports = {
  core: {
    builder: 'webpack5',
  },
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/preset-create-react-app',
    'storybook-addon-designs',
  ],
  framework: '@storybook/react',
  webpackFinal: async (config) => {
    config.resolve.fallback = {
      os: false,
      http: false,
      https: false,
      stream: false,
      crypto: false,
    };
    config.module.rules.push({
      test: /\.css$/,
      use: [
        {
          loader: 'postcss-loader',
          options: {
            ident: 'postcss',
            plugins: [require('tailwindcss'), require('autoprefixer')],
          },
        },
      ],
      include: `${__dirname}../`,
    });
    return config;
  },
};
