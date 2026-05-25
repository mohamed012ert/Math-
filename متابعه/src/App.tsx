import { AppProvider, useApp } from './context/AppContext';
import Login from './components/Login';
import Navbar from './components/Navbar';
import Loader from './components/ui/Loader';
import Toast from './components/ui/Toast';
import DashboardView from './components/views/DashboardView';
import StudentsView from './components/views/StudentsView';
import TeachersView from './components/views/TeachersView';
import SubjectsView from './components/views/SubjectsView';
import QueryView from './components/views/QueryView';

function Shell() {
  const { role, loading, currentView } = useApp();

  if (!role) return <Login />;

  return (
    <div className="min-h-screen" style={{ background: '#FAF8F0' }}>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-6">
        {currentView === 'dashboard' && <DashboardView />}
        {currentView === 'students'  && <StudentsView />}
        {currentView === 'teachers'  && <TeachersView />}
        {currentView === 'subjects'  && <SubjectsView />}
        {currentView === 'query'     && <QueryView />}
      </main>
      {loading && <Loader />}
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
