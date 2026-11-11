import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ModuleTab,
  BatchRecord,
  PassNotification,
  ThemeMode
} from './types/hardware';
import { soundEngine } from './utils/soundEngine';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { PassBanner } from './components/PassBanner';
import { KeyboardTester } from './components/KeyboardTester';
import { MouseTester } from './components/MouseTester';
import { ScreenTester } from './components/ScreenTester';
import { AudioMediaTester } from './components/AudioMediaTester';
import { GamepadTester } from './components/GamepadTester';
import { BatchHistoryTable } from './components/BatchHistoryTable';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ModuleTab>('keyboard');
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [resetDurationSec, setResetDurationSec] = useState<number>(600); // Default 10 minutes
  const [remainingSec, setRemainingSec] = useState<number>(600);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [resetSignal, setResetSignal] = useState<number>(0);
  const [passNotification, setPassNotification] = useState<PassNotification | null>(null);
  const [passedModules, setPassedModules] = useState<Set<ModuleTab>>(new Set());
  const [batchHistory, setBatchHistory] = useState<BatchRecord[]>([]);

  const escTimesRef = useRef<number[]>([]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const triggerInstantReset = useCallback(() => {
    setPassNotification(null);
    setRemainingSec(resetDurationSec);
    setResetSignal((s) => s + 1);
  }, [resetDurationSec]);

  // 1-second master clock for post-PASS auto-reset & 10-minute inactivity reset
  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingSec((prev) => {
        if (prev <= 1) {
          setPassNotification(null);
          setResetSignal((s) => s + 1);
          return resetDurationSec;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [resetDurationSec]);

  // Global Triple-ESC shortcut for instant reset
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape' && !document.fullscreenElement) {
        const now = Date.now();
        const recent = escTimesRef.current.filter((t) => now - t < 900);
        recent.push(now);
        if (recent.length >= 3) {
          escTimesRef.current = [];
          triggerInstantReset();
        } else {
          escTimesRef.current = recent;
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [triggerInstantReset]);

  const handleUserActivity = useCallback(() => {
    if (!passNotification) {
      setRemainingSec(resetDurationSec);
    }
  }, [passNotification, resetDurationSec]);

  const handleModulePass = useCallback(
    (title: string, description: string) => {
      soundEngine.playPassFanfare();
      setPassNotification({
        module: activeTab,
        title,
        description
      });
      setPassedModules((prev) => new Set(prev).add(activeTab));
      setRemainingSec(resetDurationSec);

      setBatchHistory((prev) => [
        {
          id: prev.length + 1,
          module: title,
          details: description,
          status: 'PASS',
          timestamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })
        },
        ...prev
      ]);
    },
    [activeTab, resetDurationSec]
  );

  const handleDurationChange = (seconds: number) => {
    setResetDurationSec(seconds);
    setRemainingSec(seconds);
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    soundEngine.enabled = next;
    setSoundEnabled(next);
  };

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleSelectTab = (tab: ModuleTab) => {
    setActiveTab(tab);
    setPassNotification(null);
  };

  return (
    <>
      <Header
        passCount={batchHistory.length}
        resetDurationSec={resetDurationSec}
        remainingSec={remainingSec}
        soundEnabled={soundEnabled}
        theme={theme}
        onDurationChange={handleDurationChange}
        onToggleSound={handleToggleSound}
        onToggleTheme={handleToggleTheme}
        onInstantReset={triggerInstantReset}
      />

      <Navigation
        activeTab={activeTab}
        passedModules={passedModules}
        historyCount={batchHistory.length}
        onSelectTab={handleSelectTab}
      />

      <main className="main-container">
        <PassBanner
          notification={passNotification}
          remainingSec={remainingSec}
          onResetNow={triggerInstantReset}
        />

        {activeTab === 'keyboard' && (
          <KeyboardTester
            isActive={activeTab === 'keyboard'}
            resetSignal={resetSignal}
            onActivity={handleUserActivity}
            onPass={handleModulePass}
          />
        )}

        {activeTab === 'mouse' && (
          <MouseTester
            isActive={activeTab === 'mouse'}
            resetSignal={resetSignal}
            onActivity={handleUserActivity}
            onPass={handleModulePass}
          />
        )}

        {activeTab === 'screen' && (
          <ScreenTester
            isActive={activeTab === 'screen'}
            resetSignal={resetSignal}
            onActivity={handleUserActivity}
            onPass={handleModulePass}
          />
        )}

        {activeTab === 'media' && (
          <AudioMediaTester
            resetSignal={resetSignal}
            onActivity={handleUserActivity}
            onPass={handleModulePass}
          />
        )}

        {activeTab === 'gamepad' && (
          <GamepadTester
            isActive={activeTab === 'gamepad'}
            onPass={handleModulePass}
          />
        )}

        {activeTab === 'history' && (
          <BatchHistoryTable
            records={batchHistory}
            onClearHistory={() => {
              setBatchHistory([]);
              setPassedModules(new Set());
            }}
          />
        )}
      </main>
    </>
  );
};
