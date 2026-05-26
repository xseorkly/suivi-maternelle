import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import { signOut } from '@/lib/auth';
import styles from '@/styles/admin.module.css';

export default function ParentDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login/parent');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!profile || profile.role !== 'parent') {
        router.push('/');
        return;
      }

      setUser(profile);
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  if (loading) return <div className={styles.container}>Chargement...</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>📚 Tableau de bord parent</h1>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          Déconnexion
        </button>
      </header>

      <main className={styles.main}>
        <div style={{ marginBottom: '30px' }}>
          <h2>Bienvenue {user?.name || 'Parent'} !</h2>
          <p>Accédez aux informations sur vos enfants</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          <Link href="/parent/evaluation" style={{
            padding: '20px',
            backgroundColor: '#007bff',
            color: 'white',
            borderRadius: '8px',
            textDecoration: 'none',
            textAlign: 'center',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            cursor: 'pointer',
            transition: 'background-color 0.3s'
          }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0056b3')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#007bff')}
          >
            📊 Suivi des compétences
          </Link>

          <div style={{
            padding: '20px',
            backgroundColor: '#28a745',
            color: 'white',
            borderRadius: '8px',
            textAlign: 'center',
            fontWeight: 'bold',
            fontSize: '1.1rem'
          }}>
            📋 Mes enfants
          </div>

          <div style={{
            padding: '20px',
            backgroundColor: '#ffc107',
            color: 'black',
            borderRadius: '8px',
            textAlign: 'center',
            fontWeight: 'bold',
            fontSize: '1.1rem'
          }}>
            ✉️ Messages
          </div>
        </div>

        <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
          <h3>Informations</h3>
          <p>Cet espace vous permet de suivre le développement comportemental et académique de vos enfants.</p>
        </div>
      </main>
    </div>
  );
}
