import { ImageResponse } from 'next/og'

export const size = { width: 512, height: 512 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%',
        background: '#ff1e41',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column',
        fontFamily: 'sans-serif',
      }}>
        <div style={{
          color: 'white', fontSize: 260, fontWeight: 900,
          lineHeight: 1, letterSpacing: '-8px',
          textShadow: '0 4px 20px rgba(0,0,0,0.3)',
        }}>BM</div>
        <div style={{
          color: 'rgba(255,255,255,0.7)', fontSize: 72, fontWeight: 700,
          marginTop: 8, letterSpacing: '12px', textTransform: 'uppercase',
        }}>MUSCLE</div>
      </div>
    ),
    { ...size }
  )
}
