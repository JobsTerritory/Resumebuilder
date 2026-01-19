import { useState, useEffect } from 'react';
import { initialResumeState } from './lib/initialState';
import { saveResume } from './lib/resumeService';
import { Resume } from './types';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import Editor from './components/Editor';
import PricingPage from './components/PricingPage';
import ResumeAudit from './components/ResumeAudit';

type ViewState = 'landing' | 'login' | 'signup' | 'dashboard' | 'pricing' | 'editor' | 'audit';

function App() {
  // Hash-based routing to support "Open in New Tab"
  const getHashView = (): ViewState => {
    const hash = window.location.hash.replace('#', '');
    const validViews: ViewState[] = ['landing', 'login', 'signup', 'dashboard', 'pricing', 'editor', 'audit'];
    return validViews.includes(hash as ViewState) ? (hash as ViewState) : 'landing';
  };

  const [currentView, setCurrentView] = useState<ViewState>(getHashView());
  const [saveStatus, setSaveStatus] = useState<string>('');
  const [resume, setResume] = useState<Resume>(initialResumeState);

  // Sync state with Hash changes (Browser Back/Forward or Manual URL)
  useEffect(() => {
    const handleHashChange = () => {
      const newView = getHashView();
      if (newView !== currentView) {
        setCurrentView(newView);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentView]);

  // Sync Hash with State changes (Internal Navigation)
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash !== currentView) {
      window.location.hash = currentView;
    }
  }, [currentView]);

  useEffect(() => {
    const savedResume = localStorage.getItem('currentResume');
    if (savedResume) {
      try {
        setResume(JSON.parse(savedResume));
      } catch (error) {
        console.error('Error loading saved resume:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('currentResume', JSON.stringify(resume));
  }, [resume]);

  const handleSave = async (isAuto = false) => {
    if (isAuto) {
      setSaveStatus('Auto-saving...');
    } else {
      setSaveStatus('Saving...');
    }

    const savedResume = await saveResume(resume);
    if (savedResume) {
      // Avoid overwriting state if user continued typing during save
      setResume(prev => ({
        ...prev,
        id: savedResume.id,
        updated_at: savedResume.updated_at
      }));
      setSaveStatus(isAuto ? 'Auto-saved' : 'Saved successfully!');
      setTimeout(() => setSaveStatus(''), 3000);
    } else {
      setSaveStatus('Error saving');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  // Auto-save effect
  useEffect(() => {
    if (currentView !== 'editor') return;

    const timer = setTimeout(() => {
      // Simple check to see if it's worth saving (has an ID or is not initial)
      if (resume !== initialResumeState) {
        handleSave(true);
      }
    }, 3000); // 3 second debounce

    return () => clearTimeout(timer);
  }, [resume, currentView]);

  // Navigation Handlers
  const goHome = () => setCurrentView('landing');
  const goDashboard = () => setCurrentView('dashboard');
  const goLogin = () => setCurrentView('login');
  const goSignup = () => setCurrentView('signup');

  // Render Logic
  if (currentView === 'landing') {
    return <LandingPage onGetStarted={goLogin} />;
  }

  if (currentView === 'login') {
    return <AuthPage type="login" onSuccess={goDashboard} onSwitch={goSignup} />;
  }

  if (currentView === 'signup') {
    return <AuthPage type="signup" onSuccess={goDashboard} onSwitch={goLogin} />;
  }

  if (currentView === 'dashboard') {
    return <Dashboard onLogout={goHome} onCreateNew={(initialData) => {
      if (initialData) {
        setResume(initialData);
      } else {
        setResume(initialResumeState);
      }
      setCurrentView('editor');
    }}
      onEdit={(resumeToEdit) => {
        console.log('Editing resume:', resumeToEdit.id);
        setResume(resumeToEdit);
        setCurrentView('editor');
      }}
    />;
  }

  if (currentView === 'pricing') {
    return <PricingPage onBack={goDashboard} />;
  }

  if (currentView === 'editor') {
    return (
      <Editor
        resume={resume}
        setResume={setResume}
        onSave={handleSave}
        onBack={() => setCurrentView('dashboard')}
        saveStatus={saveStatus}
      />
    );
  }

  if (currentView === 'audit') {
    return (
      <ResumeAudit
        resume={resume}
        setResume={setResume}
        onBack={() => setCurrentView('editor')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      {/* Fallback */}
    </div>
  );
}

export default App;
