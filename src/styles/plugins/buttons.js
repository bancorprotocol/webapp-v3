module.exports = function () {
  return function ({ addComponents }) {
    const buttons = {};

    buttons[`.btn`] = {
      '@apply flex items-center justify-center': '',
      '@apply px-20': '',
      '@apply text-white text-14 font-normal': '',
      '@apply outline-none focus:outline-none': '',
      '@apply transition-all duration-300': '',
      '@apply disabled:cursor-not-allowed': '',
    };

    const variants = ['primary', 'success', 'error', 'warning'];
    variants.forEach((variant) => {
      const hover = `bg-${variant}-hover`;
      buttons[`.btn-${variant}`] = {
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
      [`@apply bg-white dark:bg-charcoal`]: '',
      [`@apply border border-silver dark:border-charcoal`]: '',
      [`@apply hover:btn-secondary-hover`]: '',
      [`@apply active:transform active:scale-95`]: '',
      [`@apply disabled:bg-white disabled:text-charcoal disabled:text-opacity-50 disabled:border-charcoal disabled:border-opacity-50`]:
        '',
      [`@apply dark:disabled:bg-charcoal dark:disabled:text-grey dark:disabled:border-grey`]:
        '',
    };
    buttons[`.btn-secondary-hover`] = {
      [`@apply text-primary border-primary dark:text-primary dark:border-primary`]:
        '',
    };

    const sizes = {
      xs: {
        '@apply h-[33px] rounded-full': '',
      },
      sm: {
        '@apply h-[39px] rounded-full': '',
      },
      md: {
        '@apply h-[47px] rounded-full': '',
      },
      lg: {
        '@apply h-[53px] rounded-full': '',
      },
    };

    Object.keys(sizes).forEach((size) => {
      buttons[`.btn-${size}`] = sizes[size];
    });

    addComponents(buttons);
  };
};
