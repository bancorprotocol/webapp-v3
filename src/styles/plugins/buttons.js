module.exports = function () {
  return function ({ addComponents }) {
    const buttons = {};

    buttons[`.btn`] = {
      '@apply flex items-center justify-center': '',
      '@apply px-20': '',
      '@apply rounded-full': '',
      '@apply text-14 font-normal': '',
      '@apply outline-none focus:outline-none': '',
      '@apply transition-all duration-300': '',
      '@apply disabled:cursor-not-allowed': '',
    };

    const variants = [
      'primary',
      'success',
      'error',
      'warning',
      'black',
      'white',
    ];
    variants.forEach((variant) => {
      const textColor = variant === 'white' ? 'black' : 'white';
      const hover = `bg-${variant}-hover`;
      buttons[`.btn-${variant}`] = {
        [`@apply text-${textColor}`]: '',
        [`@apply bg-${variant}`]: '',
        [`@apply hover:${hover}`]: '',
        [`@apply active:transform active:scale-95`]: '',
        [`@apply disabled:bg-graphite`]: '',
      };
      buttons[`.btn-${variant}-hover`] = {
        [`@apply ${hover}`]: '',
      };
    });

    buttons[`.btn-secondary`] = {
      [`@apply text-black dark:text-white`]: '',
      [`@apply bg-fog dark:bg-grey`]: '',
      [`@apply hover:btn-secondary-hover`]: '',
      [`@apply active:transform active:scale-95`]: '',
      [`@apply disabled:bg-white disabled:text-charcoal disabled:text-opacity-50 disabled:border-charcoal disabled:border-opacity-50`]:
        '',
      [`@apply dark:disabled:bg-charcoal dark:disabled:text-grey dark:disabled:border-grey`]:
        '',
    };
    buttons[`.btn-secondary-hover`] = {
      [`@apply text-primary`]: '',
    };

    const sizes = {
      xs: {
        '@apply py-[5px]': '',
      },
      sm: {
        '@apply py-[9px] rounded-full': '',
      },
      md: {
        '@apply py-[13px] rounded-full': '',
      },
      lg: {
        '@apply py-[16px] rounded-full': '',
      },
    };

    Object.keys(sizes).forEach((size) => {
      buttons[`.btn-${size}`] = sizes[size];
    });

    addComponents(buttons);
  };
};
