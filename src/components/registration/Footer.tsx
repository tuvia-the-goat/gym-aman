
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-background border-t py-6">
      <div className="container mx-auto px-6 text-center text-muted-foreground">
        <p>© {new Date().getFullYear()}  מערכת אימ"ון </p>
      </div>
    </footer>
  );
};

export default Footer;
