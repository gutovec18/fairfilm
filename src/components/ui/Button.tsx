import { ArrowUpRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cx } from '../../lib'
import s from './Button.module.scss'

type Props = {
  children: ReactNode
  to?: string
  href?: string
  onClick?: () => void
  variant?: 'primary' | 'ghost' | 'dark'
  icon?: ReactNode
  className?: string
  type?: 'button' | 'submit'
}

export function Button({ children, to, href, onClick, variant = 'primary', icon, className, type = 'button' }: Props) {
  const cls = cx(s.btn, s[variant], className)
  const inner = (
    <>
      <span className={s.label}>
        <span data-text={typeof children === 'string' ? children : undefined}>{children}</span>
      </span>
      <span className={s.icon}>{icon ?? <ArrowUpRight size={18} strokeWidth={2} />}</span>
    </>
  )
  if (to) {
    return (
      <Link to={to} className={cls}>
        {inner}
      </Link>
    )
  }
  if (href) {
    const external = href.startsWith('http')
    return (
      <a href={href} className={cls} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}>
        {inner}
      </a>
    )
  }
  return (
    <button type={type} onClick={onClick} className={cls}>
      {inner}
    </button>
  )
}
