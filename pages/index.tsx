import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase, getSettings, Settings } from '@/lib/supabase';
import styles from '@/styles/home.module.css';

export default function Home() {
  const router = useRouter();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Récupérer le rôle de l'utilisateur et rediriger
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profile) {
          switch (profile.role) {
            case 'admin':
              router.push('/admin/dashboard');
              break;
            case 'enseignant':
              router.push('/teacher/dashboard');
              break;
            case 'parent':
              router.push('/parent/dashboard');
              break;
          }
        }
      }
    };

    // Récupérer les settings
    const fetchSettings = async () => {
      const data = await getSettings();
      if (data) {
        setSettings(data);
        // Appliquer les couleurs
        document.documentElement.style.setProperty('--color-primary', data.primary_color);
        document.documentElement.style.setProperty('--color-secondary', data.secondary_color);
        document.documentElement.style.setProperty('--color-tertiary', data.tertiary_color);
      }
      setLoading(false);
    };

    checkAuth();
    fetchSettings();
  }, [router]);

  if (loading) {
    return (
      <div className={styles.container}>
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {settings?.school_logo_url && (
          <img
            src={settings.school_logo_url}
            alt="Logo établissement"
            className={styles.logo}
          />
        )}

        <h1 className={styles.title}>{settings?.site_title || 'Suivi du comportement'}</h1>

        {settings?.school_name && (
          <p className={styles.subtitle}>{settings.school_name}</p>
        )}

        <div className={styles.buttons}>
          <Link href="/login/admin" className={`${styles.button} ${styles.btnAdmin}`}>
            Connexion Administrateur
          </Link>

          <Link href="/login/teacher" className={`${styles.button} ${styles.btnTeacher}`}>
            Connexion Enseignant
          </Link>

          <Link href="/login/parent" className={`${styles.button} ${styles.btnParent}`}>
            Connexion Parent
          </Link>
        </div>

        {settings?.welcome_text_parent && (
          <div className={styles.infoBox}>
            <p>{settings.welcome_text_parent}</p>
          </div>
        )}

        {settings?.legal_notice && (
          <div className={styles.footer}>
            <small>{settings.legal_notice}</small>
          </div>
        )}
      </div>
    </div>
  );
}
