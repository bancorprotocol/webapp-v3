module.exports = function () {
  return function ({ addComponents, theme }) {
    const button = {};
    const base = {
      '@apply flex items-center justify-center px-20 rounded-full': '',
      '@apply outline-none focus:outline-none focus:ring-4': '',
      '@apply transition-all duration-300': '',
      fontWeight: theme('fontWeight.500'),
      fontSize: theme('fontSize.base'),
      '&:disabled': {
        cursor: 'not-allowed',
      },
    };

    Object.keys(theme('colors')).forEach((key) => {
      if (!theme(`colors.${key}.500`)) return;
      button[`.btn-${key}`] = {
        backgroundColor: theme(`colors.${key}.500`),
        color: theme('colors.white'),
        [`@apply focus:ring-${key}-500 focus:ring-opacity-50`]: '',
        '&:hover:enabled': {
          backgroundColor: '#0053D8',
        },
        '&:disabled': {
          backgroundColor: theme(`colors.${key}.400`),
        },
      };
    });

    Object.keys(theme('colors')).forEach((key) => {
      if (!theme(`colors.${key}.500`)) return;
      button[`.btn-outline-${key}`] = {
        ...base,
        backgroundColor: theme(`colors.transparent`),
        border: '2px solid',
        borderColor: theme(`colors.${key}.500`),
        color: theme(`colors.${key}.500`),
        [`@apply focus:ring-${key}-500 focus:ring-opacity-50`]: '',
        '&:hover:enabled': {
          backgroundColor: theme(`colors.${key}.500`),
          color: theme(`colors.white`),
        },
      };
    });

    button[`.btn-secondary`] = {
      ...base,
      '@apply text-grey-4 bg-secondary': '',
      '@apply dark:text-grey-3 dark:bg-blue-2': '',
      '@apply focus:ring-grey-4 focus:ring-opacity-50': '',
    };

    button[`.btn-outline-secondary`] = {
      ...base,
      '@apply text-blue-4 bg-white': '',
      '@apply dark:text-grey-2 dark:bg-blue-2': '',
      '@apply focus:ring-grey-4 focus:ring-opacity-50': '',
      '@apply border border-grey-3': '',
    };

    const sizes = {
      xs: {
        fontSize: theme('fontSize.12'),
        height: '29px',
        borderRadius: '12px',
      },
      sm: {
        fontSize: theme('fontSize.14'),
        height: '37px',
        borderRadius: '16px',
      },
      md: {
        fontSize: theme('fontSize.16'),
        height: '47px',
        borderRadius: '18px',
      },
      xl: {
        fontSize: theme('fontSize.16'),
        height: '53px',
        borderRadius: '18px',
      },
    };

    Object.keys(sizes).forEach((key) => {
      button[`.btn-${key}`] = sizes[key];
    });

    addComponents(button);
  };
};
