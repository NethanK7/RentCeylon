export function SponsoredBadge() {
  return (
    <div
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-sans font-medium"
      style={{
        border: '1.5px solid #C9973A',
        color: '#A67928',
        background: 'linear-gradient(135deg, rgba(249,241,226,0.8), rgba(253,247,237,0.8))',
      }}
      title="Promoted Listing"
    >
      <span style={{ fontSize: 10 }}>🎀</span>
      Sponsored
      <span className="text-[9px] uppercase tracking-widest ml-0.5 opacity-60">Promoted</span>
    </div>
  )
}
