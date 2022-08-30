import { merge } from 'lodash';
import { darkTheme, lightTheme, Theme } from '@rainbow-me/rainbowkit';

export const customRainbowThemeLight = merge(lightTheme(), {
  colors: {
    accentColor: '#07296d',
  },
} as Theme);

export const customRainbowThemeDark = merge(darkTheme(), {
  colors: {
    accentColor: '#07296d',
  },
} as Theme);
