import { describe, expect, it } from 'vitest'
import {
  projects,
  projectsFiltered,
  openclassrooms1,
  openclassrooms2,
  openclassrooms3,
  iim,
  solead,
  allProjectsImages,
  allProjectsGifs,
  openclassroomsImages,
  allprojects_cover,
  paro_standalone_cover,
  ascent_standalone_cover,
  claquettes_standalone_cover,
} from './Data'

const STANDALONE_TITLES = ['Paro', 'Ascent', 'claquettes-swing.fr']
const allCategories = [projects, openclassrooms1, openclassrooms2, openclassrooms3, iim, solead]

describe('catalogues de projets', () => {
  it.each([
    ['projects', projects],
    ['openclassrooms1', openclassrooms1],
    ['openclassrooms2', openclassrooms2],
    ['openclassrooms3', openclassrooms3],
    ['iim', iim],
    ['solead', solead],
  ])('%s est non vide', (_name, list) => {
    expect(list.length).toBeGreaterThan(0)
  })

  it('chaque projet a un titre, une description et une image', () => {
    for (const project of allCategories.flat()) {
      expect(project.title).toBeTruthy()
      expect(project.description).toBeTruthy()
      expect(project.image).toBeTruthy()
    }
  })

  it("les titres sont uniques à l'intérieur de chaque catégorie", () => {
    for (const list of allCategories) {
      const titles = list.map(p => p.title)
      expect(new Set(titles).size).toBe(titles.length)
    }
  })
})

describe('projectsFiltered', () => {
  it('exclut les projets affichés en slides standalone', () => {
    const titles = projectsFiltered.map(p => p.title)
    for (const excluded of STANDALONE_TITLES) {
      expect(titles).not.toContain(excluded)
    }
  })

  it('conserve tous les autres projets', () => {
    expect(projectsFiltered).toHaveLength(projects.length - STANDALONE_TITLES.length)
  })
})

describe('listes agrégées', () => {
  it('allProjectsImages ne contient aucune valeur vide', () => {
    expect(allProjectsImages.length).toBeGreaterThan(0)
    expect(allProjectsImages.every(Boolean)).toBe(true)
  })

  it('allProjectsGifs ne contient aucune valeur vide', () => {
    expect(allProjectsGifs.length).toBeGreaterThan(0)
    expect(allProjectsGifs.every(Boolean)).toBe(true)
  })

  it('openclassroomsImages agrège les trois formations', () => {
    expect(openclassroomsImages).toHaveLength(
      openclassrooms1.length + openclassrooms2.length + openclassrooms3.length
    )
  })

  it("allProjectsImages n'inclut pas les projets standalone", () => {
    const standaloneImages = projects
      .filter(p => STANDALONE_TITLES.includes(p.title))
      .map(p => p.image)
    for (const image of standaloneImages) {
      expect(allProjectsImages).not.toContain(image)
    }
  })
})

describe('covers de slides', () => {
  const covers = [
    ['allprojects_cover', allprojects_cover],
    ['paro_standalone_cover', paro_standalone_cover],
    ['ascent_standalone_cover', ascent_standalone_cover],
    ['claquettes_standalone_cover', claquettes_standalone_cover],
  ] as const

  it.each(covers)('%s a un slug, un titre et une image principale', (_name, cover) => {
    expect(cover.slug).toBeTruthy()
    expect(cover.title).toBeTruthy()
    expect(cover.mainImage).toBeTruthy()
  })

  it('les slugs des covers sont uniques', () => {
    const slugs = covers.map(([, cover]) => cover.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('paro_standalone_cover expose ses 4 visuels', () => {
    expect(paro_standalone_cover.sideImages).toHaveLength(4)
    for (const url of paro_standalone_cover.sideImages) {
      expect(url).toMatch(/^https:\/\/res\.cloudinary\.com\//)
    }
  })
})
