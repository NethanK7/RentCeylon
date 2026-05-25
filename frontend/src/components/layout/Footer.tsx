import Link from 'next/link'

const LINKS = {
  Explore:  [['Browse Listings', '/browse'], ['How It Works', '/about'], ['For Listers', '/pricing'], ['Property', '/property-management']],
  Company:  [['About', '/about'], ['Trust & Safety', '/about'], ['Careers', '#'], ['Blog', '#']],
  Support:  [['Help Centre', '#'], ['Contact Us', '#'], ['Disputes', '#'], ['Privacy Policy', '#'], ['Terms of Service', '#']],
}

export function Footer() {
  return (
    <footer style={{ background: '#0C1124' }} className="text-white/70">
      <div className="max-w-[1440px] mx-auto px-8 md:px-16">

        {/* Top rule */}
        <div className="h-px bg-white/8 mb-16" />

        <div className="grid grid-cols-2 md:grid-cols-5 gap-12 pb-16">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-6">
              <div
                className="w-5 h-5 flex items-center justify-center"
                style={{ border: '1px solid rgba(201,151,58,0.6)' }}
              >
                <span className="font-mono text-[7px] text-gold tracking-tight">RL</span>
              </div>
              <span className="font-display text-xl text-white font-light tracking-tight">RentLoop</span>
            </div>
            <p className="font-sans text-sm text-white/40 leading-relaxed max-w-xs mb-6">
              Sri Lanka's trusted peer-to-peer rental marketplace.
              Built with care in Colombo.
            </p>
            {/* Blue stripe accent */}
            <div className="w-12 h-px bg-royal mb-6" />
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-white/30 tracking-[0.15em] uppercase">Secured by</span>
              <span className="font-mono text-xs text-white/50 border border-white/10 px-2 py-0.5">PayHere</span>
              <span className="font-mono text-xs text-white/50 border border-white/10 px-2 py-0.5">iPay</span>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([section, links]) => (
            <div key={section}>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/25 mb-5">{section}</p>
              <ul className="space-y-3">
                {links.map(([label, href]) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="font-sans text-sm text-white/45 hover:text-white transition-colors duration-150"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="h-px bg-white/8 mb-6" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-8">
          <p className="font-mono text-[11px] text-white/25 tracking-wide">
            © 2025 RentLoop (Pvt) Ltd. — Colombo, Sri Lanka
          </p>
          <div className="flex items-center gap-6">
            {['Privacy', 'Terms', 'Cookies'].map((l) => (
              <Link key={l} href="#" className="font-mono text-[11px] text-white/25 hover:text-white/50 transition-colors">
                {l}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
