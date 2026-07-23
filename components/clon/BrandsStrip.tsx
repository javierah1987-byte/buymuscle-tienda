// Carrusel de marcas — clon del bloque de fabricantes del pie de la home
// PrestaShop: los 17 logos reales (rehospedados en clon-home/), en marquee
// continuo suave (pausa al hover). Logos con página propia enlazan a
// /marca/<slug>; StreetFlavour a su página; el resto, al catálogo.
const CDN = 'https://awwlbepjxuoxaigztugh.supabase.co/storage/v1/object/public/product-images/clon-home/'

const BRANDS: { img: string; name: string; href: string }[] = [
  { img: 'brand-barebells.jpg', name: 'Barebells', href: '/tienda' },
  { img: 'brand-big.jpg', name: 'BIG', href: '/tienda' },
  { img: 'brand-biotech-usa.jpg', name: 'BiotechUSA', href: '/marca/biotechusa' },
  { img: 'brand-buy-muscle.jpg', name: 'Buy Muscle', href: '/tienda' },
  { img: 'brand-eleve11fit.jpg', name: 'Eleve11Fit', href: '/tienda' },
  { img: 'brand-fa-nutrition.jpg', name: 'FA Nutrition', href: '/tienda' },
  { img: 'brand-gn.jpg', name: 'GN Nutrition', href: '/marca/gnnutrition' },
  { img: 'brand-himalaya-herbals.jpg', name: 'Himalaya Herbals', href: '/tienda' },
  { img: 'brand-iogenix.jpg', name: 'iO.GENIX', href: '/marca/iogenix' },
  { img: 'brand-max-protein.jpg', name: 'Max Protein', href: '/tienda' },
  { img: 'brand-muscle-master.jpg', name: 'Muscle Master', href: '/tienda' },
  { img: 'brand-muscletech.jpg', name: 'MuscleTech', href: '/tienda' },
  { img: 'brand-protella.jpg', name: 'Protella', href: '/tienda' },
  { img: 'brand-scitec-nutrition.jpg', name: 'Scitec Nutrition', href: '/marca/scitec' },
  { img: 'brand-stacker-2-europe.jpg', name: 'Stacker 2 Europe', href: '/tienda' },
  { img: 'brand-streetflavour.jpg', name: 'StreetFlavour', href: '/streetflavour' },
  { img: 'brand-zoomadlabs.jpg', name: 'Zoomad Labs', href: '/tienda' },
]

export default function BrandsStrip() {
  // Track duplicado ×2: la animación CSS desplaza −50% y reinicia — bucle perfecto.
  const doubled = [...BRANDS, ...BRANDS]
  return (
    <section aria-label="Nuestras marcas" style={{ background: 'white', padding: '2rem 0', borderTop: '1px solid #ebebeb' }}>
      <div className="clon-marquee-mask">
        <div className="clon-marquee-track">
          {doubled.map((b, i) => (
            <a key={i} href={b.href} title={b.name} aria-hidden={i >= BRANDS.length}
              tabIndex={i >= BRANDS.length ? -1 : undefined} className="clon-brand-logo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={CDN + b.img} alt={b.name} loading="lazy" style={{ height: 52, width: 'auto', display: 'block' }} />
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
