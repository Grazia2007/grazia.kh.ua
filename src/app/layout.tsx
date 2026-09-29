import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const YEARS = new Date().getFullYear() - 2007;
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

// schema.org: service-area business (виїзд на адресу, без офісу)
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FurnitureStore",
  "name": "Меблі Grazia",
  "url": "https://grazia.kh.ua",
  "description": "Корпусні меблі на замовлення у Харкові: кухні, шафи, гардеробні. Виїзд дизайнера на адресу.",
  "foundingDate": "2007-12-04",
  "telephone": ["+380506878243", "+380935346322"],
  "address": { "@type": "PostalAddress", "addressLocality": "Харків", "addressRegion": "Харківська область", "addressCountry": "UA" },
  "areaServed": [{ "@type": "City", "name": "Харків" }, { "@type": "AdministrativeArea", "name": "Харківська область" }],
  "sameAs": ["https://www.instagram.com/grazia.kh.ua/", "https://www.youtube.com/@graziakhua", "https://t.me/MarinaGrazia"],
};

// Оновлені метадані для Меблі Grazia
export const metadata: Metadata = {
  title: "Кухні та шафи на замовлення у Харкові — Меблі Grazia",
  description: `Виробництво корпусних меблів у Харкові: кухні, шафи, гардеробні на замовлення. ${YEARS} років досвіду, виїзд дизайнера на адресу.`,
  icons: {
    icon: '/favicon.ico', // Твій новий логотип
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk" suppressHydrationWarning>
      <head>
        {/* тема застосовується до першого фарбування - інакше спалах світлої */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(localStorage.getItem('grazia-theme')==='dark'){document.documentElement.classList.add('dark')}}catch(e){}})();`,
          }}
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-full flex flex-col`}>
        {children}
        {GA_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
            <Script id="ga-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${GA_ID}');
document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href]');if(!a)return;var h=a.getAttribute('href')||'';var m=h.indexOf('tel:')===0?'phone':h.indexOf('viber:')===0?'viber':h.indexOf('wa.me')>-1?'whatsapp':h.indexOf('t.me/')>-1?'telegram':null;if(m)gtag('event','contact_click',{method:m});},{passive:true});`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}