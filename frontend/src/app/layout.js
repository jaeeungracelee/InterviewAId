"use client";

import React from 'react';
import ParticlesComponent from '../components/ParticlesComponent';
import './globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Your App</title>
      </head>
      <body style={{ margin: 0, padding: 0, overflow: 'hidden', position: 'relative' }}>
        <ParticlesComponent />
        <div style={{ position: 'relative', zIndex: 1 }}>
          {children}
        </div>
      </body>
    </html>
  );
}
