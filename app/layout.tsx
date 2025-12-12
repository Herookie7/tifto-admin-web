import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import Script from 'next/script';

// ✅ Add metadata export for favicon
export const metadata = {
  title: 'Tifto Admin Dashboard',
  icons: {
    icon: '/favicon.png',
    // You can add more like:
    // shortcut: "/favicon.png",
    // apple: "/apple-touch-icon.png"
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages({ locale });

  return (
    <html lang={locale}>
       <head>
        {/* 
          Microsoft Clarity Analytics
          
          Note: Browser cookie warnings for "_clsk" are expected and safe to ignore.
          These are third-party cookies from Microsoft Clarity used for analytics tracking.
          The warnings occur because modern browsers (with dynamic state partitioning) 
          restrict third-party cookie access for privacy reasons.
          
          The warnings do not affect functionality - Clarity will work with reduced 
          tracking capabilities. To fully eliminate warnings, you would need to either:
          1. Remove Microsoft Clarity analytics
          2. Use a first-party analytics solution
          3. Accept that reduced third-party cookie functionality is a privacy feature
        */}
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "tjqxrz689j");
          `}
        </Script>
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
