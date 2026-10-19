import { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react'
import { AUTO_REPLIES, SEED_CREATIVES, seedState } from '../data/seed'
import type { AppState, Brief, Creative, Message, PortfolioItem } from '../types'

const STORAGE_KEY = 'duet-community-v1'

export const uid = () => Math.random().toString(36).slice(2, 10)

type Action =
  | { type: 'saveProfile'; profile: Creative }
  | { type: 'addWork'; work: PortfolioItem }
  | { type: 'removeWork'; id: string }
  | { type: 'toggleLike'; workId: string }
  | { type: 'toggleFollow'; creativeId: string }
  | { type: 'sendMessage'; message: Message }
  | { type: 'submitBrief'; brief: Brief }
  | { type: 'signOut' }
  | { type: 'reset' }

function updateMe(state: AppState, fn: (me: Creative) => Creative): AppState {
  return {
    ...state,
    creatives: state.creatives.map((c) => (c.id === state.meId ? fn(c) : c)),
  }
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'saveProfile': {
      const exists = state.creatives.some((c) => c.id === action.profile.id)
      return {
        ...state,
        meId: action.profile.id,
        creatives: exists
          ? state.creatives.map((c) => (c.id === action.profile.id ? action.profile : c))
          : [action.profile, ...state.creatives],
      }
    }
    case 'addWork':
      return updateMe(state, (me) => ({ ...me, portfolio: [action.work, ...me.portfolio] }))
    case 'removeWork':
      return updateMe(state, (me) => ({
        ...me,
        portfolio: me.portfolio.filter((w) => w.id !== action.id),
      }))
    case 'toggleLike': {
      if (!state.meId) return state
      const current = state.likes[action.workId] ?? []
      const next = current.includes(state.meId)
        ? current.filter((id) => id !== state.meId)
        : [...current, state.meId]
      return { ...state, likes: { ...state.likes, [action.workId]: next } }
    }
    case 'toggleFollow': {
      const following = state.following.includes(action.creativeId)
        ? state.following.filter((id) => id !== action.creativeId)
        : [...state.following, action.creativeId]
      return { ...state, following }
    }
    case 'sendMessage':
      return { ...state, messages: [...state.messages, action.message] }
    case 'submitBrief':
      return { ...state, briefs: [action.brief, ...state.briefs] }
    case 'signOut':
      return { ...state, meId: null }
    case 'reset':
      return seedState()
  }
}

function load(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return withNewSeeds({ ...seedState(), ...JSON.parse(raw) })
  } catch {
    // Private mode or corrupt data: fall back to the seed.
  }
  return seedState()
}

/** Saved demos predate newer sample people and fields (like `role`); add those without touching user data. */
function withNewSeeds(state: AppState): AppState {
  const seeds = new Map(SEED_CREATIVES.map((c) => [c.id, c]))
  const seedWork = new Map(SEED_CREATIVES.flatMap((c) => c.portfolio).map((w) => [w.id, w]))
  const saved = state.creatives.map((c) => {
    const seed = seeds.get(c.id)
    if (!seed) return c
    // Seed photos win: they're sample data, and older saves have none.
    return {
      ...seed,
      ...c,
      photo: seed.photo,
      portfolio: c.portfolio.map((w) => (seedWork.has(w.id) ? { ...w, photo: seedWork.get(w.id)!.photo } : w)),
    }
  })
  const savedIds = new Set(saved.map((c) => c.id))
  return { ...state, creatives: [...saved, ...SEED_CREATIVES.filter((c) => !savedIds.has(c.id))] }
}

interface Store {
  state: AppState
  me: Creative | null
  dispatch: (action: Action) => void
  creative: (id: string) => Creative | undefined
}

const StoreContext = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // Storage unavailable: the session still works in memory.
    }
  }, [state])

  // Demo nicety: the first message to someone gets a friendly reply.
  useEffect(() => {
    const last = state.messages[state.messages.length - 1]
    if (!last || last.from !== state.meId) return
    const thread = state.messages.filter(
      (m) => (m.from === last.to && m.to === last.from) || (m.from === last.from && m.to === last.to),
    )
    if (thread.length !== 1) return
    const timer = setTimeout(() => {
      dispatch({
        type: 'sendMessage',
        message: {
          id: uid(),
          from: last.to,
          to: last.from,
          body: AUTO_REPLIES[last.to.length % AUTO_REPLIES.length],
          sentAt: Date.now(),
        },
      })
    }, 1500)
    return () => clearTimeout(timer)
  }, [state.messages, state.meId])

  const me = state.creatives.find((c) => c.id === state.meId) ?? null
  const creative = (id: string) => state.creatives.find((c) => c.id === id)

  return (
    <StoreContext.Provider value={{ state, me, dispatch, creative }}>{children}</StoreContext.Provider>
  )
}

export function useStore(): Store {
  const store = useContext(StoreContext)
  if (!store) throw new Error('useStore must be used inside StoreProvider')
  return store
}
