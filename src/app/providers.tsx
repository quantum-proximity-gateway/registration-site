"use client";

import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { ThemeProvider } from 'next-themes';
import { defaultSystem } from "@chakra-ui/react"

// If you want to customize your Chakra theme, import extendTheme:
// import { extendTheme } from '@chakra-ui/react';
// const customTheme = extendTheme({ ... });

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ChakraProvider value={defaultSystem}>
        {children}
      </ChakraProvider>
    </ThemeProvider>
  );
}
