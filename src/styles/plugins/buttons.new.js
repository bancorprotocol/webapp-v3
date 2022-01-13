module.exports = function () {
  return function ({ addComponents }) {
    const buttons = {};

    buttons[`.btn-base`] = {
      '@apply flex items-center justify-center': '',
      '@apply px-20': '',
      '@apply text-white text-14 font-normal': '',
      '@apply outline-none focus:outline-none': '',
      '@apply transition-all duration-300': '',
      '@apply disabled:opacity-70 disabled:cursor-not-allowed': '',
    };

    const variants = ['primary', 'success', 'error', 'warning', 'info'];
    variants.forEach((variant) => {
      const hover = `bg-${variant}-700`;
      buttons[`.btn-${variant}-new`] = {
        [`@apply bg-${variant}`]: '',
        [`@apply hover:${hover}`]: '',
        [`@apply active:transform active:scale-95`]: '',
        [`@apply disabled:bg-${variant}`]: '',
      };
      buttons[`.btn-${variant}-hover`] = {
        [`@apply ${hover}`]: '',
      };
    });

    const sizes = {
      xs: {
        '@apply h-[33px] rounded-[14px]': '',
      },
      sm: {
        '@apply h-[39px] rounded-[14px]': '',
      },
      md: {
        '@apply h-[47px] rounded-[18px]': '',
      },
      lg: {
        '@apply h-[53px] rounded-[18px]': '',
      },
    };

    Object.keys(sizes).forEach((size) => {
      buttons[`.btn-${size}-new`] = sizes[size];
    });

    addComponents(buttons);
  };
};
