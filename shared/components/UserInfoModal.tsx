"use client";

import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { UserInfo, UserInfoModalProps } from '@/shared/types/user';
import { toast } from 'react-hot-toast';

export function UserInfoModal({ userId, isOpen, onClose }: UserInfoModalProps) {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserInfo() {
      if (!userId) return;
      
      try {
        setLoading(true);
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
          setUserInfo({
            displayName: userDoc.data().displayName || 'Nav norādīts',
            email: userDoc.data().email || 'Nav norādīts',
            description: userDoc.data().description || 'Nav apraksta',
            isTeacher: userDoc.data().isTeacher || false,
            status: userDoc.data().status || 'inactive',
            createdAt: userDoc.data().createdAt?.toDate?.().toLocaleDateString('lv-LV') || 'Nav norādīts'
          });
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
        toast.error("Neizdevās ielādēt lietotāja informāciju");
      } finally {
        setLoading(false);
      }
    }

    if (isOpen) {
      fetchUserInfo();
    }
  }, [userId, isOpen]);

  if (!isOpen) return null;

  return (
    <dialog className={`modal ${isOpen ? 'modal-open' : ''}`}>
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">
          {userInfo?.isTeacher ? 'Pasniedzēja informācija' : 'Skolēna informācija'}
        </h3>
        
        {loading ? (
          <div className="flex justify-center">
            <div className="loading loading-spinner loading-lg"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="font-semibold">Vārds:</label>
              <p>{userInfo?.displayName}</p>
            </div>
            
            <div>
              <label className="font-semibold">E-pasts:</label>
              <p>{userInfo?.email}</p>
            </div>
            
            <div>
              <label className="font-semibold">Apraksts:</label>
              <p className="whitespace-pre-wrap">{userInfo?.description}</p>
            </div>
            
            <div>
              <label className="font-semibold">Statuss:</label>
              <p>{userInfo?.status === 'active' ? 'Aktīvs' : 'Neaktīvs'}</p>
            </div>
            
            <div>
              <label className="font-semibold">Pievienojās:</label>
              <p>{userInfo?.createdAt}</p>
            </div>
          </div>
        )}

        <div className="modal-action">
          <button className="btn" onClick={onClose}>
            Aizvērt
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
} 