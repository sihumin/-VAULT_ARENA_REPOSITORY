import React from 'react';
import { auth } from '../lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate('/vault');
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 text-zinc-900 font-sans">
      <div className="p-10 bg-white border border-zinc-200 text-center max-w-sm w-full shadow-sm rounded-sm">
        <div className="flex justify-center mb-4">
          <div className="bg-zinc-900 text-white p-3 rounded">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
        </div>
        <h1 className="text-xl font-bold tracking-tight mb-1">VaultArena</h1>
        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-8">Authorized Access Only</p>
        <button 
          onClick={handleLogin}
          className="w-full bg-zinc-900 text-white py-2.5 px-4 text-sm font-medium hover:bg-zinc-800 transition-colors rounded"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
