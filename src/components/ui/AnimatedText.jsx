import { useState, useEffect } from 'react'
import styles from './AnimatedText.module.css'

/*
 * Variants:
 *   "gradient"   — shifting gold gradient fill
 *   "chrome"     — metallic sheen with scrolling reflection
 *   "typewriter" — types out character by character
 *   "vault"      — "Rating" static + "Vault" swings open (once per session)
 */

export function GradientText({ children, as: Tag = 'span', className = '', ...props }) {
  return (
    <Tag className={`${styles.gradient} ${className}`} {...props}>
      {children}
    </Tag>
  )
}

export function ChromeText({ children, as: Tag = 'span', className = '', ...props }) {
  return (
    <Tag className={className} style={{ position: 'relative', display: 'inline-block' }} {...props}>
      <span className={styles.chrome}>{children}</span>
      <span className={styles.chromeShine} aria-hidden>{children}</span>
    </Tag>
  )
}

export function TypewriterText({ children, className = '' }) {
  const text = typeof children === 'string' ? children : ''
  return (
    <span
      className={`${styles.typewriter} ${className}`}
      style={{ '--char-count': text.length }}
    >
      {text}
    </span>
  )
}

export function VaultLogo({ className = '' }) {
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const key = 'rv-vault-played'
    if (!sessionStorage.getItem(key)) {
      setAnimated(true)
      sessionStorage.setItem(key, '1')
    }
  }, [])

  return (
    <span className={`${styles.vault} ${className}`}>
      <span className={styles.vaultRating}>Rating</span>
      <span className={animated ? styles.vaultDoor : styles.vaultDoorStatic}>Vault</span>
    </span>
  )
}
