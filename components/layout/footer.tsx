import { IconoGitHub } from '@/components/icons/IconoGitHub';
import { IconoLinkedIn } from '@/components/icons/IconoLinkedIn';
import { IconoTwitter } from '@/components/icons/IconoTwitter';
import { IconoEmail } from '@/components/icons/IconoEmail';
import { IconoTelefono } from '@/components/icons/IconoTelefono';
import React from 'react';

export const Footer = () => {
  // Enlaces de redes sociales
  const socialLinks = [
    { href: "https://github.com/conacad", icon: IconoGitHub, title: "GitHub" },
    { href: "https://linkedin.com/company/conacad", icon: IconoLinkedIn, title: "LinkedIn" },
    { href: "https://twitter.com/conacad", icon: IconoTwitter, title: "Twitter" },
  ];

  // Información de contacto
  const contactInfo = [
    { icon: IconoEmail, text: "contacto@conacad.com", href: "mailto:contacto@conacad.com" },
    { icon: IconoTelefono, text: "+1 (555) 123-4567", href: "tel:+15551234567" },
  ];

  // Enlaces de navegación organizados por categorías
  const footerSections = [
    {
      title: "Soporte",
      links: [
        { href: "/help", text: "Centro de Ayuda" },
        { href: "/contact", text: "Contacto" },
        { href: "/faq", text: "FAQ" },
        { href: "/status", text: "Estado del Sistema" },
      ]
    },
    {
      title: "Legal",
      links: [
        { href: "/privacy", text: "Privacidad" },
        { href: "/terms", text: "Términos" },
        { href: "/cookies", text: "Cookies" },
        { href: "/about", text: "Acerca de" },
      ]
    }
  ];

  return (
    <footer className="bg-gray-950 mt-auto border-t border-gray-800">
      <div className="container mx-auto px-4 py-12">
        
        {/* Contenido principal del footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          
          {/* Sección de marca y contacto */}
          <div className="lg:col-span-2 space-y-6">
            {/* Logo y descripción */}
            <div>
              <h2 className="text-3xl font-bold text-white mb-3">Conacad</h2>
              <p className="text-gray-400 text-sm leading-relaxed max-w-md">
                Plataforma educativa innovadora que conecta estudiantes y profesores 
                para crear experiencias de aprendizaje excepcionales.
              </p>
            </div>
            
            {/* Información de contacto */}
            <div className="space-y-3">
              <h3 className="text-white font-semibold text-sm uppercase tracking-wide">Contacto</h3>
              <div className="space-y-2">
                {contactInfo.map((contact, index) => (
                  <a
                    key={index}
                    href={contact.href}
                    className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group"
                  >
                    <contact.icon className="h-4 w-4 group-hover:text-primary transition-colors" />
                    <span className="text-sm">{contact.text}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Secciones de enlaces */}
          {footerSections.map((section, index) => (
            <div key={index} className="space-y-4">
              <h3 className="text-white font-semibold text-sm uppercase tracking-wide">
                {section.title}
              </h3>
              <nav className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <a
                    key={linkIndex}
                    href={link.href}
                    className="block text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.text}
                  </a>
                ))}
              </nav>
            </div>
          ))}
        </div>

        {/* Separador */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            
            {/* Copyright */}
            <div className="text-center md:text-left">
              <p className="text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} Conacad. Todos los derechos reservados.
              </p>
            </div>

            {/* Redes sociales */}
            <div className="flex items-center gap-1">
              <span className="text-gray-400 text-sm mr-4">Síguenos:</span>
              <div className="flex gap-3">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
                    title={social.title}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <social.icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};