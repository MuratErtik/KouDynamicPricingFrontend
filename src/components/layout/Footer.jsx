import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-slate-800 text-slate-300 py-6 mt-auto">
      <div className="container mx-auto px-4 text-center">
        <p>&copy; {new Date().getFullYear()} KOU Airlines. Tüm hakları saklıdır.</p>
        <p className="text-sm text-slate-500 mt-2">Bitirme Projesi Kapsamında Geliştirilmiştir.</p>
      </div>
    </footer>
  );
};

export default Footer;