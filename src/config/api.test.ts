import { describe, expect, it, vi, afterEach } from 'vitest'
import { getApiUrl } from './api'

const PRODUCTION_API_URL = 'https://back-aurelienallenic-fr.vercel.app'

describe('getApiUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('utilise VITE_API_URL quand la variable est définie', () => {
    vi.stubEnv('VITE_API_URL', 'https://api.example.com')
    expect(getApiUrl()).toBe('https://api.example.com')
  })

  it("retire le slash final de l'URL", () => {
    vi.stubEnv('VITE_API_URL', 'https://api.example.com/')
    expect(getApiUrl()).toBe('https://api.example.com')
  })

  it("retombe sur l'URL de production quand PROD est actif", () => {
    vi.stubEnv('VITE_API_URL', '')
    vi.stubEnv('PROD', true)
    expect(getApiUrl()).toBe(PRODUCTION_API_URL)
  })

  it('retombe sur localhost en dehors de la production', () => {
    vi.stubEnv('VITE_API_URL', '')
    vi.stubEnv('PROD', false)
    expect(getApiUrl()).toBe('http://localhost:3000')
  })
})
