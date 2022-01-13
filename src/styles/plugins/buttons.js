module.exports = function () {
  return function ({ addComponents, theme }) {
    const button = {};
    const base = {
      '@apply flex items-center justify-center px-30 rounded-full': '',
      '@apply outline-none focus:outline-none focus:ring-4': '',
      '@apply transition-all duration-300': '',
      fontWeight: theme('fontWeight.500'),
      height: '54px',
      fontSize: theme('fontSize.base'),
    };
    const baseDisabled = {
      '&:disabled': {
        opacity: 0.7,
        cursor: 'not-allowed',
      },
    };

    Object.keys(theme('colors')).forEach((key) => {
      if (!theme(`colors.${key}.500`)) return;
      button[`.btn-${key}`] = {
        ...base,
        backgroundColor: theme(`colors.${key}.500`),
        color: theme('colors.white.DEFAULT'),
        [`@apply focus:ring-${key}-500 focus:ring-opacity-50`]: '',
        '&:hover': {
          backgroundColor: theme(`colors.${key}.700`),
        },
        '&:active': {
          backgroundColor: theme(`colors.${key}.400`),
        },
        '&:disabled': {
          ...baseDisabled,
          backgroundColor: theme(`colors.${key}.500`),
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
        '&:hover': {
          backgroundColor: theme(`colors.${key}.500`),
          color: theme(`colors.white.DEFAULT`),
        },
        '&:active': {
          backgroundColor: theme(`colors.${key}.400`),
          color: theme(`colors.white.DEFAULT`),
          borderColor: theme(`colors.${key}.400`),
        },
        '&:disabled': {
          ...baseDisabled,
        },
      };
    });

    button[`.btn-secondary`] = {
      ...base,
      '@apply text-grey-4 bg-secondary': '',
      '@apply dark:text-grey-3 dark:bg-blue-2': '',
      '@apply focus:ring-grey-4 focus:ring-opacity-50': '',
      '&:disabled': {
        ...baseDisabled,
      },
    };

    button[`.btn-outline-secondary`] = {
      ...base,
      '@apply text-blue-4 bg-white': '',
      '@apply dark:text-grey-2 dark:bg-blue-2': '',
      '@apply focus:ring-grey-4 focus:ring-opacity-50': '',
      '@apply border border-grey-3': '',
      '&:disabled': {
        ...baseDisabled,
      },
    };

    const sizes = {
      xs: {
        '@apply text-14 w-[94px] h-[33px] px-10 focus:ring-2 rounded-[14px]':
          '',
      },
      sm: {
        '@apply text-14 w-[142px] h-[39px] px-10 focus:ring-2 rounded-[14px]':
          '',
      },
      md: {
        '@apply text-14 w-[266px] h-[47px] px-10 focus:ring-2 rounded-[18px]':
          '',
      },
      lg: {
        '@apply text-14 w-[428px] h-[53px] px-10 focus:ring-2 rounded-[18px]':
          '',
      },
      xl: {
        fontSize: theme('fontSize.20'),
        height: '60px',
      },
    };

    Object.keys(sizes).forEach((key) => {
      button[`.btn-${key}`] = sizes[key];
    });

    addComponents(button);
  };
};
