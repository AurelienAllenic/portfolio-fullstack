import { describe, expect, it } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { LanguageProvider, useLanguage } from './LanguageContext'

const Probe = () => {
  const { language, setLanguage, t } = useLanguage()
  return (
    <div>
      <span data-testid="lang">{language}</span>
      <span data-testid="translation">{t('nav.contact')}</span>
      <button onClick={() => setLanguage('en')}>en</button>
    </div>
  )
}

const renderProbe = () =>
  render(
    <LanguageProvider>
      <Probe />
    </LanguageProvider>
  )

describe('LanguageProvider', () => {
  it('utilise le français par défaut', () => {
    renderProbe()
    expect(screen.getByTestId('lang')).toHaveTextContent('fr')
    expect(screen.getByTestId('translation')).toHaveTextContent('Contact')
  })

  it('restaure la langue enregistrée dans le localStorage', () => {
    localStorage.setItem('language', 'en')
    renderProbe()
    expect(screen.getByTestId('lang')).toHaveTextContent('en')
  })

  it('ignore une valeur de localStorage invalide', () => {
    localStorage.setItem('language', 'de')
    renderProbe()
    expect(screen.getByTestId('lang')).toHaveTextContent('fr')
  })

  it('persiste la langue lors du changement', () => {
    renderProbe()
    act(() => {
      screen.getByRole('button', { name: 'en' }).click()
    })
    expect(screen.getByTestId('lang')).toHaveTextContent('en')
    expect(localStorage.getItem('language')).toBe('en')
  })

  it("renvoie la clé quand la traduction n'existe pas", () => {
    const Missing = () => <span data-testid="missing">{useLanguage().t('cle.inconnue')}</span>
    render(
      <LanguageProvider>
        <Missing />
      </LanguageProvider>
    )
    expect(screen.getByTestId('missing')).toHaveTextContent('cle.inconnue')
  })
})

describe('useLanguage', () => {
  it('lève une erreur hors du LanguageProvider', () => {
    expect(() => render(<Probe />)).toThrow(/must be used within a LanguageProvider/)
  })
})
