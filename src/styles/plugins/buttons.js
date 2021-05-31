const merge = require('lodash/merge');

const defaultOptions = (theme) => {
  return {
    btnStyle: {
      fontWeight: theme('fontWeight.600'),
      height: '51px',
      fontSize: theme('fontSize.base'),
      '@apply flex items-center px-10 rounded-full border-2 transition-all duration-300 focus:outline-none outline-none focus:ring-4':
        '',
    },
    sizes: {
      xs: {
        fontSize: theme('fontSize.12'),
        height: '28px',
      },
      sm: {
        fontSize: theme('fontSize.14'),
        height: '32px',
      },
      lg: {
        fontSize: theme('fontSize.18'),
        height: '44px',
      },
      xl: {
        fontSize: theme('fontSize.20'),
        height: '60px',
      },
    },
  };
};
module.exports = function (options = {}, extend = true) {
  return function ({ addComponents, theme }) {
    if (extend) options = merge(options, defaultOptions(theme));

    const button = {};

    Object.keys(theme('colors')).forEach((key) => {
      if (!theme(`colors.${key}.500`) || !theme(`colors.${key}.500`)) return;
      button[`.btn-${key}`] = {
        ...options.btnStyle,
        backgroundColor: theme(`colors.${key}.500`),
        color: theme('colors.white'),
        borderColor: theme(`colors.${key}.500`),
        [`@apply focus:ring-${key}-500 focus:ring-opacity-50`]: '',
        '&:hover': {
          backgroundColor: theme(`colors.${key}.800`),
          borderColor: theme(`colors.${key}.800`),
        },
        '&:active': {
          backgroundColor: theme(`colors.${key}.400`),
          borderColor: theme(`colors.${key}.400`),
        },
        '&:disabled': {
          backgroundColor: theme(`colors.${key}.500`),
          borderColor: theme(`colors.${key}.500`),
          opacity: 0.7,
          cursor: 'not-allowed',
        },
      };
    });

    Object.keys(theme('colors')).forEach((key) => {
      if (!theme(`colors.${key}.500`) || !theme(`colors.${key}.500`)) return;
      button[`.btn-outline-${key}`] = {
        ...options.btnStyle,
        backgroundColor: theme(`colors.transparent`),
        borderColor: theme(`colors.${key}.500`),
        color: theme(`colors.${key}.500`),
        [`@apply focus:ring-${key}-400 focus:ring-offset-2`]: '',
        '&:hover': {
          backgroundColor: theme(`colors.${key}.500`),
          color: theme(`colors.white`),
        },
        '&:active': {
          backgroundColor: theme(`colors.${key}.700`),
          color: theme(`colors.white`),
          borderColor: theme(`colors.${key}.700`),
        },
        '&:disabled': {
          backgroundColor: theme(`colors.transparent`),
          borderColor: theme(`colors.${key}.300`),
          color: theme(`colors.${key}.500`),
          cursor: 'not-allowed',
        },
      };
    });

    Object.keys(options.sizes).forEach((key) => {
      button[`.btn-${key}`] = options.sizes[key];
    });

    addComponents(button);
  };
};
