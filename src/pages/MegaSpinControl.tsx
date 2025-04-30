import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const MegaSpinControl = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  useEffect(() => {
    // Now checking if username contains 'admin' instead of checking email
    const isAdmin = user && user.username?.toLowerCase().includes('admin');
    
    if (!isAdmin) {
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <div>
      <h1>MegaSpin Control</h1>
    </div>
  );
};

export default MegaSpinControl;
