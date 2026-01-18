# 🚀 GUIDE DE MIGRATION - Nouvelle Architecture

## ✅ **CE QUI A ÉTÉ CRÉÉ**

### **1. AppStateContext** (`src/state/AppStateContext.tsx`)
**Single Source of Truth** - Tout l'état de l'application centralisé :
- ✅ État de section (heroBeforeScroll, heroAfterScroll, projects, contact)
- ✅ Sous-états (textIndex, categoryIndex)
- ✅ Gestion des transitions
- ✅ Logique de navigation complète

**API Exposée** :
```typescript
const { 
  state,                          // État complet de l'app
  goToHeroBeforeScroll,          // Navigation vers HeroBeforeScroll
  goToHeroAfterScroll,           // Navigation vers HeroAfterScroll
  goToProjects,                  // Navigation vers Projects
  goToContact,                   // Navigation vers Contact
  setHeroTextIndex,              // Changer de texte dans HeroAfterScroll
  setProjectsCategoryIndex,      // Changer de catégorie dans Projects
  handleScrollUp,                // Gérer scroll haut
  handleScrollDown,              // Gérer scroll bas
} = useAppState();
```

### **2. ScrollManager** (`src/hooks/useScrollManager.ts`)
**Gestionnaire de scroll unique** :
- ✅ Un seul `window.addEventListener("wheel")`
- ✅ Gestion du touch pour mobile
- ✅ Debouncing automatique
- ✅ Respecte le scroll naturel (quand scrollY > 50)

### **3. SinglePage.new.tsx**
**Architecture simplifiée** :
- ✅ Tous les composants toujours montés
- ✅ Visibilité contrôlée par `display: none/block`
- ✅ Pas de montage/démontage = pas de perte d'event listeners
- ✅ État déterministe

### **4. Nav.new.tsx**
**Navigation adaptée** :
- ✅ Utilise `goToHeroBeforeScroll()`, `goToProjects()`, etc.
- ✅ Plus de callbacks complexes
- ✅ Navigation directe et prévisible

---

## 📋 **PLAN DE MIGRATION - ÉTAPE PAR ÉTAPE**

### **ÉTAPE 1 : Tester le nouveau système en parallèle**

1. **Garder l'ancien système actif** (ne rien toucher pour l'instant)

2. **Créer une route de test** dans `App.tsx` :
```typescript
import SinglePageNew from "./SinglePage.new";

<Routes>
  <Route path="/" element={<SinglePage />} />
  <Route path="/test-new" element={<SinglePageNew />} /> {/* NOUVEAU */}
  {/* ... autres routes ... */}
</Routes>
```

3. **Tester** : Visitez `http://localhost:5173/test-new`

### **ÉTAPE 2 : Adapter les composants Hero, Projects, Contact**

Pour que le nouveau système fonctionne, il faut adapter ces composants. Voici les signatures attendues :

#### **Hero**
```typescript
interface HeroProps {
  heroState: "hero1" | "hero2";
  textIndex?: number;
  isVisible: boolean;
}
```

**Changements nécessaires** :
- Retirer tous les event listeners de scroll (géré par ScrollManager)
- Utiliser `heroState` et `textIndex` comme props (pas d'état local)
- Réagir aux changements de `isVisible` pour les animations

#### **Projects**
```typescript
interface ProjectsProps {
  isVisible: boolean;
}
```

**Changements nécessaires** :
- Retirer event listeners de scroll
- Réagir à `isVisible` pour animations

#### **SliderProjects**
```typescript
interface SliderProjectsProps {
  categoryIndex: number;
  isVisible: boolean;
}
```

**Changements nécessaires** :
- Retirer event listeners de scroll
- Utiliser `categoryIndex` comme prop (pas d'état local)
- Réagir à `isVisible`

#### **Contact**
```typescript
interface ContactProps {
  isVisible: boolean;
}
```

**Changements nécessaires** :
- Réagir à `isVisible` pour animations

---

## 🔧 **OPTION 1 : Je continue la migration (RECOMMANDÉ)**

Je peux continuer et **adapter tous les composants** pour vous. Cela prendra environ 100-150 modifications supplémentaires.

**Avantages** :
- ✅ Système complet fonctionnel
- ✅ Tous les bugs résolus
- ✅ Code maintenable

**Durée** : ~30-45 minutes

---

## 🔧 **OPTION 2 : Vous testez d'abord le concept**

Vous pouvez tester le nouveau système dès maintenant en :

1. Créant des versions simplifiées de Hero/Projects/Contact
2. Les connectant à `SinglePage.new.tsx`
3. Testant sur `/test-new`

Une fois validé, on migre complètement.

---

## 📊 **COMPARAISON ANCIEN vs NOUVEAU**

| Aspect | Ancien Système | Nouveau Système |
|--------|---------------|-----------------|
| **Event Listeners** | 5+ listeners (conflits) | 1 seul listener centralisé |
| **État** | Fragmenté sur 5 composants | Centralisé dans AppStateContext |
| **Montage** | Conditionnel (bugs) | Permanent (stable) |
| **Callbacks** | Chaînes asynchrones | Direct |
| **Debuggabilité** | Difficile | Facile (1 source) |
| **Maintenabilité** | Faible | Élevée |

---

## 🎯 **PROCHAINE ÉTAPE**

**Voulez-vous que je continue ?**

- ✅ **Option A** : Je continue et j'adapte Hero, Projects, SliderProjects, Contact
- 🧪 **Option B** : Je crée des versions simplifiées pour un test rapide d'abord
- ❓ **Option C** : Vous avez des questions sur l'architecture

Dites-moi comment vous souhaitez procéder !
