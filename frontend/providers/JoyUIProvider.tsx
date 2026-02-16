'use client';

import { CssVarsProvider, extendTheme } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import { GlobalStyles } from '@mui/joy';

// Minimal Dashboard inspired theme
const theme = extendTheme({
    colorSchemes: {
        light: {
            palette: {
                primary: {
                    50: '#E0F7FA',
                    100: '#B2EBF2',
                    200: '#80DEEA',
                    300: '#4DD0E1',
                    400: '#26C6DA',
                    500: '#06b6d4', // Main cyan color
                    600: '#00ACC1',
                    700: '#0097A7',
                    800: '#00838F',
                    900: '#006064',
                },
                background: {
                    body: '#F9FAFB', // Minimal Dashboard background
                    surface: '#FFFFFF',
                    level1: '#F4F6F8',
                    level2: '#DFE3E8',
                },
                text: {
                    primary: '#212B36',
                    secondary: '#637381',
                    tertiary: '#919EAB',
                },
            },
        },
        dark: {
            palette: {
                primary: {
                    50: '#E0F7FA',
                    100: '#B2EBF2',
                    200: '#80DEEA',
                    300: '#4DD0E1',
                    400: '#26C6DA',
                    500: '#06b6d4',
                    600: '#00ACC1',
                    700: '#0097A7',
                    800: '#00838F',
                    900: '#006064',
                },
                background: {
                    body: '#161C24',
                    surface: '#212B36',
                    level1: '#1C252E',
                    level2: '#2D3843',
                },
            },
        },
    },
    fontFamily: {
        display: '"Public Sans", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        body: '"Public Sans", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    radius: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
    },
    shadow: {
        xs: '0 0 2px 0 rgba(145, 158, 171, 0.2), 0 4px 8px -2px rgba(145, 158, 171, 0.12)',
        sm: '0 0 2px 0 rgba(145, 158, 171, 0.2), 0 8px 16px -4px rgba(145, 158, 171, 0.12)',
        md: '0 0 2px 0 rgba(145, 158, 171, 0.2), 0 12px 24px -4px rgba(145, 158, 171, 0.12)',
        lg: '0 0 2px 0 rgba(145, 158, 171, 0.2), 0 16px 32px -4px rgba(145, 158, 171, 0.12)',
        xl: '0 0 2px 0 rgba(145, 158, 171, 0.2), 0 20px 40px -4px rgba(145, 158, 171, 0.12)',
    },
    components: {
        JoyCard: {
            styleOverrides: {
                root: {
                    borderRadius: '16px',
                    boxShadow: '0 0 2px 0 rgba(145, 158, 171, 0.2), 0 12px 24px -4px rgba(145, 158, 171, 0.12)',
                },
            },
        },
    },
});

export default function JoyUIProvider({ children }: { children: React.ReactNode }) {
    return (
        <CssVarsProvider theme={theme} defaultMode="light">
            <CssBaseline />
            <GlobalStyles
                styles={{
                    ':root': {
                        '--joy-palette-background-body': '#F9FAFB',
                    },
                    body: {
                        fontFamily: '"Public Sans", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    },
                }}
            />
            {children}
        </CssVarsProvider>
    );
}
