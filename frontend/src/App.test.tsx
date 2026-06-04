import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

// Мокаем localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

beforeEach(() => {
  mockLocalStorage.clear();
});

test('renders login page when not authenticated', async () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  
  await waitFor(() => {
    const loginElement = screen.getByText(/Вход в систему/i);
    expect(loginElement).toBeInTheDocument();
  }, { timeout: 2000 });
});

test('renders loading state initially', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  
  const loadingElement = screen.getByText(/Загрузка/i);
  expect(loadingElement).toBeInTheDocument();
});
