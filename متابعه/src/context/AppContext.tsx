import React, {
  createContext,
  useCallback,
  useContext,
  useReducer,
  useRef,
} from 'react';
import type { AppData, Role, TeacherAuth, ToastType, ViewId } from '../types';
import { fetchAllData } from '../api';

// ─── State ────────────────────────────────────────────────────────────────────
interface State {
  role: Role | null;
  teacher: TeacherAuth | null;
  data: AppData;
  loading: boolean;
  currentView: ViewId;
  toast: { msg: string; type: ToastType; visible: boolean } | null;
}

const initial: State = {
  role: null,
  teacher: null,
  data: { students: [], subjects: [], teachers: [] },
  loading: false,
  currentView: 'query',
  toast: null,
};

// ─── Actions ──────────────────────────────────────────────────────────────────
type Action =
  | { type: 'SET_ROLE'; role: Role; teacher: TeacherAuth | null }
  | { type: 'LOGOUT' }
  | { type: 'SET_DATA'; data: AppData }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_VIEW'; view: ViewId }
  | { type: 'SHOW_TOAST'; msg: string; toastType: ToastType }
  | { type: 'HIDE_TOAST' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_ROLE':
      return { ...state, role: action.role, teacher: action.teacher };
    case 'LOGOUT':
      return { ...initial };
    case 'SET_DATA':
      return { ...state, data: action.data };
    case 'SET_LOADING':
      return { ...state, loading: action.loading };
    case 'SET_VIEW':
      return { ...state, currentView: action.view };
    case 'SHOW_TOAST':
      return { ...state, toast: { msg: action.msg, type: action.toastType, visible: true } };
    case 'HIDE_TOAST':
      return { ...state, toast: state.toast ? { ...state.toast, visible: false } : null };
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────
interface Ctx extends State {
  setLoading: (v: boolean) => void;
  setView: (v: ViewId) => void;
  showToast: (msg: string, type?: ToastType) => void;
  logout: () => void;
  startApp: (role: Role, teacher: TeacherAuth | null) => Promise<void>;
  reloadData: () => Promise<void>;
}

const AppCtx = createContext<Ctx>(null!);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setLoading = useCallback((v: boolean) => dispatch({ type: 'SET_LOADING', loading: v }), []);
  const setView = useCallback((v: ViewId) => dispatch({ type: 'SET_VIEW', view: v }), []);

  const showToast = useCallback((msg: string, type: ToastType = 'success') => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    dispatch({ type: 'SHOW_TOAST', msg, toastType: type });
    toastTimer.current = setTimeout(() => dispatch({ type: 'HIDE_TOAST' }), 3200);
  }, []);

  const logout = useCallback(() => dispatch({ type: 'LOGOUT' }), []);

  const reloadData = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', loading: true });
    const data = await fetchAllData();
    dispatch({ type: 'SET_DATA', data });
    dispatch({ type: 'SET_LOADING', loading: false });
  }, []);

  const startApp = useCallback(
    async (role: Role, teacher: TeacherAuth | null) => {
      dispatch({ type: 'SET_ROLE', role, teacher });
      dispatch({ type: 'SET_LOADING', loading: true });
      const data = await fetchAllData();
      dispatch({ type: 'SET_DATA', data });
      dispatch({ type: 'SET_LOADING', loading: false });
      dispatch({ type: 'SET_VIEW', view: role === 'public' ? 'query' : 'dashboard' });
    },
    []
  );

  return (
    <AppCtx.Provider
      value={{ ...state, setLoading, setView, showToast, logout, startApp, reloadData }}
    >
      {children}
    </AppCtx.Provider>
  );
}

export const useApp = () => useContext(AppCtx);
