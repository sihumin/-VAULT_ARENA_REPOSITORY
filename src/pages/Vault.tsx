import React, { useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export default function Vault() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [secret, setSecret] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        navigate('/login');
        return;
      }
      try {
        const docRef = doc(db, 'vaults', user.uid, 'items', 'main');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setTitle(docSnap.data().title || '');
          setSecret(docSnap.data().secret || '');
        }
      } catch (e) {
        console.error('Unauthorized or not found', e);
      } finally {
        setLoading(false);
      }
    });
    return unsubscribe;
  }, [navigate]);

  const handleSave = async () => {
    if (!auth.currentUser) return;
    try {
      const docRef = doc(db, 'vaults', auth.currentUser.uid, 'items', 'main');
      await setDoc(docRef, {
        ownerUid: auth.currentUser.uid,
        title,
        secret,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      alert('Vault saved securely.');
    } catch (e) {
      console.error(e);
      alert('Failed to save. Permission denied.');
    }
  };

  if (loading) return <div className="p-8 font-sans text-zinc-500 bg-zinc-50 min-h-screen text-sm">Verifying authorization...</div>;

  return (
    <div className="min-h-screen bg-zinc-50 flex justify-center items-center font-sans text-zinc-900 p-6">
      <div className="bg-white border border-zinc-200 w-full max-w-md shadow-sm rounded">
        <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
          <div>
            <h1 className="text-sm font-bold text-zinc-700 uppercase tracking-widest">Secure Vault</h1>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">Core Asset Management</p>
          </div>
          <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded uppercase">Authorized</span>
        </div>
        
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2">Document Title</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-zinc-200 p-2.5 bg-zinc-50 focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 text-sm font-medium rounded-sm transition-all"
            />
          </div>
          <div>
            <label className="block text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2">Secret Content</label>
            <textarea 
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              className="w-full border border-zinc-200 p-2.5 h-32 bg-zinc-50 focus:outline-none focus:ring-1 focus:ring-zinc-400 focus:border-zinc-400 text-sm font-mono rounded-sm transition-all"
            />
          </div>
          <button 
            onClick={handleSave}
            className="w-full bg-zinc-900 text-white p-2.5 text-sm font-medium hover:bg-zinc-800 transition-colors rounded mt-2"
          >
            Commit Changes
          </button>
          <div className="text-center pt-2">
            <button 
              onClick={() => auth.signOut()}
              className="text-[11px] font-bold text-zinc-400 hover:text-zinc-700 uppercase tracking-widest transition-colors"
            >
              Sign Out / Disconnect
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
