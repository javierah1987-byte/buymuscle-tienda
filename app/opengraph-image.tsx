import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'BUYMUSCLE — Suplementación deportiva en Canarias'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#000000',
        }}
      >
        <div
          style={{
            fontSize: 130,
            fontWeight: 900,
            fontStyle: 'italic',
            color: '#ff1e41',
            letterSpacing: '-0.03em',
            lineHeight: 1,
          }}
        >
          BUYMUSCLE
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 38,
            fontWeight: 600,
            color: '#ffffff',
            letterSpacing: '0.02em',
          }}
        >
          Suplementación deportiva en Canarias
        </div>
        <div
          style={{
            marginTop: 48,
            width: 120,
            height: 6,
            background: '#ff1e41',
          }}
        />
      </div>
    ),
    { ...size }
  )
}
