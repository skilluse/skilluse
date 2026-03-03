'use client'

/*
 * Editorial components — adapted from playwriter.dev for Next.js.
 * All components use CSS variables defined in globals.css.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import Prism from 'prismjs'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-tsx'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-yaml'

/* =========================================================================
   TOC sidebar (fixed left)
   ========================================================================= */

function useActiveTocId() {
  const [activeId, setActiveId] = useState('')

  useEffect(() => {
    const headings = document.querySelectorAll<HTMLElement>('h1[id]')
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible: string[] = []
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.target.id) {
            visible.push(entry.target.id)
          }
        })
        if (visible.length > 0) {
          const sorted = visible.sort((a, b) => {
            const elA = document.getElementById(a)
            const elB = document.getElementById(b)
            if (!elA || !elB) return 0
            return elA.getBoundingClientRect().top - elB.getBoundingClientRect().top
          })
          setActiveId(sorted[sorted.length - 1])
        }
      },
      { rootMargin: '-80px 0px -75% 0px', threshold: 0 },
    )

    headings.forEach((h) => observer.observe(h))
    return () => observer.disconnect()
  }, [])

  return activeId
}

export function TableOfContents({
  items,
  logo,
}: {
  items: Array<{ label: string; href: string }>
  logo?: string
}) {
  const activeId = useActiveTocId()

  return (
    <aside
      className='fixed top-[80px] hidden lg:block'
      style={{ left: 'max(1rem, calc((100vw - 550px) / 2 - 200px))', width: '122px' }}
    >
      <nav>
        <a
          href='/'
          className='no-underline transition-colors block'
          style={{
            fontSize: '14px',
            fontWeight: 700,
            lineHeight: '20px',
            letterSpacing: '-0.09px',
            padding: '4px 0',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-primary)',
            marginBottom: '8px',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
        >
          {logo ?? 'index'}
        </a>
        {items.map((item) => {
          const isActive = `#${activeId}` === item.href
          const defaultColor = isActive ? 'var(--text-primary)' : 'var(--text-secondary)'
          return (
            <a
              key={item.href}
              href={item.href}
              className='block no-underline'
              style={{
                fontSize: '13px',
                fontWeight: 475,
                lineHeight: '15.6px',
                letterSpacing: '-0.04px',
                padding: '5px 0',
                color: defaultColor,
                fontFamily: 'var(--font-primary)',
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.color = 'var(--text-hover)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = defaultColor
              }}
            >
              {item.label}
            </a>
          )
        })}
      </nav>
    </aside>
  )
}

/* =========================================================================
   Typography
   ========================================================================= */

export function SectionHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h1
      id={id}
      className='scroll-mt-[5.25rem]'
      style={{
        fontFamily: 'var(--font-primary)',
        fontSize: '14px',
        fontWeight: 560,
        lineHeight: '20px',
        letterSpacing: '-0.09px',
        color: 'var(--text-primary)',
        margin: 0,
        padding: 0,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        paddingTop: '24px',
        paddingBottom: '24px',
      }}
    >
      <span style={{ whiteSpace: 'nowrap' }}>{children}</span>
      <span style={{ flex: 1, height: '1px', background: 'var(--divider)' }} />
    </h1>
  )
}

export function Section({
  id,
  title,
  children,
}: {
  id: string
  title: string
  children: React.ReactNode
}) {
  return (
    <>
      <SectionHeading id={id}>{title}</SectionHeading>
      {children}
    </>
  )
}

export function P({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <p
      className={`editorial-prose ${className}`}
      style={{
        fontFamily: 'var(--font-primary)',
        fontSize: '14px',
        fontWeight: 475,
        lineHeight: '22px',
        letterSpacing: '-0.09px',
        color: 'var(--text-primary)',
        opacity: 0.82,
        margin: 0,
      }}
    >
      {children}
    </p>
  )
}

export function Caption({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontFamily: 'var(--font-primary)',
        fontSize: '12px',
        fontWeight: 475,
        textAlign: 'center',
        lineHeight: '20px',
        letterSpacing: '-0.09px',
        color: 'var(--text-secondary)',
        margin: 0,
      }}
    >
      {children}
    </p>
  )
}

export function A({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target='_blank'
      rel='noopener noreferrer'
      style={{ color: 'var(--link-accent, #0969da)', fontWeight: 600, textDecoration: 'none' }}
      onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
      onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
    >
      {children}
    </a>
  )
}

export function Code({ children }: { children: React.ReactNode }) {
  return <code className='inline-code'>{children}</code>
}

export function Divider() {
  return (
    <div style={{ padding: '24px 0', display: 'flex', alignItems: 'center' }}>
      <div style={{ height: '1px', background: 'var(--divider)', flex: 1 }} />
    </div>
  )
}

export function OL({ children }: { children: React.ReactNode }) {
  return (
    <ol
      className='m-0 pl-5'
      style={{
        fontFamily: 'var(--font-primary)',
        fontSize: '14px',
        fontWeight: 475,
        lineHeight: '20px',
        letterSpacing: '-0.09px',
        color: 'var(--text-primary)',
        listStyleType: 'decimal',
      }}
    >
      {children}
    </ol>
  )
}

export function List({ children }: { children: React.ReactNode }) {
  return (
    <ul
      className='m-0 pl-5'
      style={{
        fontFamily: 'var(--font-primary)',
        fontSize: '14px',
        fontWeight: 475,
        lineHeight: '20px',
        letterSpacing: '-0.09px',
        color: 'var(--text-primary)',
        listStyleType: 'disc',
      }}
    >
      {children}
    </ul>
  )
}

export function Li({ children }: { children: React.ReactNode }) {
  return <li style={{ padding: '0 0 8px 12px' }}>{children}</li>
}

/* =========================================================================
   Code block with Prism syntax highlighting and line numbers
   ========================================================================= */

export function CodeBlock({
  children,
  lang = 'bash',
  lineHeight = '1.85',
  showLineNumbers = true,
}: {
  children: string
  lang?: string
  lineHeight?: string
  showLineNumbers?: boolean
}) {
  const codeRef = useRef<HTMLElement>(null)
  const lines = children.split('\n')

  useEffect(() => {
    if (codeRef.current && lang) {
      Prism.highlightElement(codeRef.current)
    }
  }, [children, lang])

  return (
    <figure className='m-0 bleed'>
      <div className='relative'>
        <pre
          className='overflow-x-auto'
          style={{ borderRadius: '8px', margin: 0, padding: 0, background: 'var(--code-bg)' }}
        >
          <div
            className='flex'
            style={{
              padding: '12px 8px 8px',
              fontFamily: 'var(--font-code)',
              fontSize: '12px',
              fontWeight: 400,
              lineHeight,
              letterSpacing: 'normal',
              color: 'var(--text-primary)',
              tabSize: 2,
            }}
          >
            {showLineNumbers && (
              <span
                className='select-none shrink-0'
                aria-hidden='true'
                style={{
                  color: 'var(--code-line-nr)',
                  textAlign: 'right',
                  paddingRight: '20px',
                  width: '36px',
                  userSelect: 'none',
                }}
              >
                {lines.map((_, i) => (
                  <span key={i} className='block'>
                    {i + 1}
                  </span>
                ))}
              </span>
            )}
            <code
              ref={codeRef}
              className={lang ? `language-${lang}` : undefined}
              style={{ whiteSpace: 'pre', background: 'none', padding: 0, lineHeight }}
            >
              {children}
            </code>
          </div>
        </pre>
      </div>
    </figure>
  )
}

/* =========================================================================
   Comparison table
   ========================================================================= */

export function ComparisonTable({
  title,
  headers,
  rows,
}: {
  title?: string
  headers: [string, string, string]
  rows: Array<[string, string, string]>
}) {
  return (
    <div className='w-full max-w-full overflow-x-auto' style={{ padding: '8px 0' }}>
      {title && (
        <div
          style={{
            fontFamily: 'var(--font-primary)',
            fontSize: '11px',
            fontWeight: 400,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.02em',
            padding: '0 0 6px',
          }}
        >
          {title}
        </div>
      )}
      <table className='w-full' style={{ borderSpacing: 0, borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                className='text-left'
                style={{
                  padding: '4.8px 12px 4.8px 0',
                  fontSize: '11px',
                  fontWeight: 400,
                  fontFamily: 'var(--font-primary)',
                  color: 'var(--text-muted)',
                  borderBottom: '1px solid var(--page-border)',
                }}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(([feature, col2, col3]) => (
            <tr key={feature}>
              {[feature, col2, col3].map((cell, i) => (
                <td
                  key={i}
                  style={{
                    padding: '4.8px 12px 4.8px 0',
                    fontSize: '11px',
                    fontWeight: 500,
                    fontFamily: 'var(--font-code)',
                    color: 'var(--text-primary)',
                    borderBottom: '1px solid var(--page-border)',
                    whiteSpace: i < 2 ? 'nowrap' : undefined,
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* =========================================================================
   Page shell — wraps content with editorial layout + TOC
   ========================================================================= */

export function EditorialPage({
  toc,
  logo,
  children,
}: {
  toc: Array<{ label: string; href: string }>
  logo?: string
  children: React.ReactNode
}) {
  return (
    <div
      className='editorial-page relative min-h-screen overflow-x-hidden'
      style={{
        background: 'var(--bg)',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-primary)',
        WebkitFontSmoothing: 'antialiased',
        textRendering: 'optimizeLegibility',
      }}
    >
      <TableOfContents items={toc} logo={logo} />
      <div className='mx-auto' style={{ width: '550px', maxWidth: 'calc(100% - 2rem)', padding: '0 1rem 6rem' }}>
        <div style={{ height: '80px' }} />
        <article className='editorial-article flex flex-col gap-[32px]'>{children}</article>
      </div>
    </div>
  )
}
