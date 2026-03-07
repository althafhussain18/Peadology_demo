import { GraduationCap, Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react"

const footerLinks = {
  company: [
    { name: "About Us", href: "#" },
    { name: "Careers", href: "#" },
    { name: "Blog", href: "#" },
    { name: "Press", href: "#" },
  ],
  support: [
    { name: "Help Center", href: "#" },
    { name: "Safety", href: "#" },
    { name: "Community Guidelines", href: "#" },
    { name: "Contact Us", href: "#" },
  ],
  legal: [
    { name: "Terms of Service", href: "#" },
    { name: "Privacy Policy", href: "#" },
    { name: "Cookie Policy", href: "#" },
    { name: "Parental Consent", href: "#" },
  ],
}

const socialLinks = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Youtube, href: "#", label: "YouTube" },
]

export function Footer() {
  return (
    <footer id="about" className="bg-foreground text-background mt-20 scroll-mt-20">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-2">
            <a href="#" className="flex items-center gap-2 mb-6">
              <div className="bg-primary rounded-xl p-2">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span
                className="text-2xl font-bold text-background"
                style={{ fontFamily: "var(--font-display)" }}
              >
                LearnQuest
              </span>
            </a>
            <p className="text-background/70 mb-6 max-w-sm">
              Making learning fun and accessible for every child. Join millions of students on their educational journey.
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-background/70">
                <Mail className="w-5 h-5" />
                <span>hello@learnquest.edu</span>
              </div>
              <div className="flex items-center gap-3 text-background/70">
                <Phone className="w-5 h-5" />
                <span>1-800-LEARN-FUN</span>
              </div>
              <div className="flex items-center gap-3 text-background/70">
                <MapPin className="w-5 h-5" />
                <span>123 Education Lane, Knowledge City</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-background mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-background/70 hover:text-background transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-background mb-4">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-background/70 hover:text-background transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-background mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-background/70 hover:text-background transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-background/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-background/70 text-sm">
            &copy; 2026 LearnQuest. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => {
              const Icon = social.icon
              return (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 bg-background/10 hover:bg-primary rounded-full flex items-center justify-center transition-colors"
                  aria-label={social.label}
                >
                  <Icon className="w-5 h-5" />
                </a>
              )
            })}
          </div>
        </div>
      </div>
    </footer>
  )
}
