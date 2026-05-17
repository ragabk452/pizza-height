import { Send } from 'lucide-react';

const footerLinks = {
  menu: [
    { label: 'Signature Pizzas', href: '#' },
    { label: 'Salads', href: '#' },
    { label: 'Wines', href: '#' },
    { label: 'Desserts', href: '#' },
  ],
  company: [
    { label: 'Our Story', href: '#' },
    { label: 'Locations', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Press', href: '#' },
  ],
  support: [
    { label: 'Contact Us', href: '#' },
    { label: 'FAQ', href: '#' },
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
  ],
};

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function TwitterIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
    </svg>
  );
}

const social = [
  { Icon: InstagramIcon, href: '#', label: 'Instagram' },
  { Icon: TwitterIcon, href: '#', label: 'Twitter' },
  { Icon: FacebookIcon, href: '#', label: 'Facebook' },
];

export function Footer() {
  return (
    <footer className="border-border bg-surface/40 relative border-t">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
        {/* Top: Brand + Newsletter */}
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <div className="font-display text-foreground text-3xl">
              Pizza <span className="text-primary">Height</span>
            </div>
            <p className="text-muted mt-4 max-w-md text-sm">
              Hand-crafted, wood-fired, ritualistically obsessed pizza. Elevating your taste, one
              pie at a time.
            </p>
          </div>

          <div>
            <h3 className="font-display text-foreground text-xl">Get pizza in your inbox</h3>
            <p className="text-muted mt-2 text-sm">
              Specials, new pies, the occasional pizza haiku. No spam.
            </p>
            <form className="mt-5 flex gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                className="border-border bg-background text-foreground placeholder:text-muted focus:border-primary focus:ring-primary/30 flex-1 rounded-lg border px-4 py-3 text-sm focus:ring-2 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-primary text-background hover:bg-primary-hover inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-medium transition-all hover:-translate-y-0.5"
              >
                <Send className="size-4" />
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Middle: Link columns */}
        <div className="mt-16 grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-4">
          <div>
            <h4 className="text-primary text-xs font-semibold tracking-wider uppercase">Menu</h4>
            <ul className="mt-4 space-y-3">
              {footerLinks.menu.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-muted hover:text-foreground text-sm transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-primary text-xs font-semibold tracking-wider uppercase">Company</h4>
            <ul className="mt-4 space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-muted hover:text-foreground text-sm transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-primary text-xs font-semibold tracking-wider uppercase">Support</h4>
            <ul className="mt-4 space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-muted hover:text-foreground text-sm transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-primary text-xs font-semibold tracking-wider uppercase">Follow</h4>
            <div className="mt-4 flex gap-3">
              {social.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="border-border bg-background text-muted hover:border-primary hover:bg-primary hover:text-background flex size-10 items-center justify-center rounded-full border transition-all hover:-translate-y-0.5"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-border mt-16 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row">
          <p className="text-muted text-xs">
            © {new Date().getFullYear()} Pizza Height. All rights reserved.
          </p>
          <p className="text-muted text-xs">Crafted with obsession in Egypt 🇪🇬</p>
        </div>
      </div>
    </footer>
  );
}
