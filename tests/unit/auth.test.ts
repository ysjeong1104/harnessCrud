import { describe, it, expect } from 'vitest'
import {
  hashPassword,
  verifyPassword,
  createSessionToken,
  verifySessionToken,
} from '@/lib/auth'

describe('hashPassword / verifyPassword', () => {
  it('올바른 비밀번호를 검증한다', () => {
    const hash = hashPassword('mypassword123')
    expect(hash).toContain(':')
    expect(verifyPassword('mypassword123', hash)).toBe(true)
  })

  it('잘못된 비밀번호는 false를 반환한다', () => {
    const hash = hashPassword('correctpassword')
    expect(verifyPassword('wrongpassword', hash)).toBe(false)
  })

  it('동일 비밀번호라도 해시가 다르다 (salt 적용)', () => {
    const hash1 = hashPassword('samepassword')
    const hash2 = hashPassword('samepassword')
    expect(hash1).not.toBe(hash2)
    expect(verifyPassword('samepassword', hash1)).toBe(true)
    expect(verifyPassword('samepassword', hash2)).toBe(true)
  })

  it('잘못된 형식의 해시는 false를 반환한다', () => {
    expect(verifyPassword('password', 'invalidstoredformat')).toBe(false)
  })
})

describe('createSessionToken / verifySessionToken', () => {
  it('유효한 토큰을 생성하고 userSeq를 반환한다', () => {
    const token = createSessionToken(42)
    expect(token).toMatch(/^\d+\.[a-f0-9]+$/)
    expect(verifySessionToken(token)).toBe(42)
  })

  it('다양한 seq 값으로 토큰을 생성한다', () => {
    expect(verifySessionToken(createSessionToken(1))).toBe(1)
    expect(verifySessionToken(createSessionToken(9999))).toBe(9999)
  })

  it('변조된 토큰은 null을 반환한다', () => {
    const token = createSessionToken(1)
    const tampered = token.slice(0, -3) + 'xxx'
    expect(verifySessionToken(tampered)).toBeNull()
  })

  it('dot이 없는 토큰은 null을 반환한다', () => {
    expect(verifySessionToken('nodottoken')).toBeNull()
  })

  it('빈 문자열은 null을 반환한다', () => {
    expect(verifySessionToken('')).toBeNull()
  })
})
