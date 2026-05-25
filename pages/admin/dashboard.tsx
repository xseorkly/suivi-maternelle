import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase, getSettings, Settings } from '@/lib/supabase';
import { signOut } from '@/lib/auth';
import styles from '@/styles/admin.module.css';

export default function AdminDashboard() {
  const router = useRouter();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [stats, setStats] = useState({
    classes: 0,
    teachers: 0,
    students: 0,
    parents: 0,
    comments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login/admin');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!profile || profile.role !== 'admin') {
        router.push('/');
        return;
      }

      setUser(user);

      // Récupérer les settings
      const { data: settingsData } = await supabase
        .from('settings')
        .select('*')
        .single();

      if (settingsData) {
        setSettings(settingsData);
        document.documentElement.style.setProperty('--color-primary', settingsData.primary_color);
        document.documentElement.style.setProperty('--color-secondary', settingsData.secondary_color);
      }

      // Récupérer les statistiques
      const { count: classesCount } = await supabase
        .from('classes')
        .select('*', { count: 'exact', head: true });

      const { count: teachersCount } = await supabase
        .from('enseignants')
        .select('*', { count: 'exact', head: true });

      const { count: studentsCount } = await supabase
        .from('eleves')
        .select('*', { count: 'exact', head: true });

      const { count: parentsCount } = await supabase
        .from('parents')
        .select('*', { count: 'exact', head: true });

      const { count: commentsCount } = await supabase
        .from('commentaires')
        .select('*', { count: 'exact', head: true });

      setStats({
        classes: classesCount || 0,
        teachers: teachersCount || 0,
        students: studentsCount || 0,
        parents: parentsCount || 0,
        comments: commentsCount || 0,
      });

      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  if (loading) {
    return <div className={styles.container}>Chargement...</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          {settings?.school_logo_url && (
            <img src={settings.school_logo_url} alt="Logo" className={styles.headerLogo} />
          )}
          <div>
            <h1>{settings?.school_name || 'Établissement'}</h1>
            <p>Tableau de bord administrateur</p>
          </div>
        </div>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          Déconnexion
        </button>
      </header>

      <main className={styles.main}>
        <section className={styles.statsSection}>
          <h2>Aperçu général</h2>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>{stats.classes}</div>
              <div className={styles.statLabel}>Classes</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>{stats.teachers}</div>
              <div className={styles.statLabel}>Enseignants</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>{stats.students}</div>
              <div className={styles.statLabel}>Élèves</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>{stats.parents}</div>
              <div className={styles.statLabel}>Parents</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>{stats.comments}</div>
              <div className={styles.statLabel}>Commentaires</div>
            </div>
          </div>
        </section>

        <section className={styles.actionsSection}>
          <h2>Gestion</h2>
          <div className={styles.actionsGrid}>
            <Link href="/admin/settings" className={styles.actionCard}>
              <div className={styles.actionIcon}>⚙️</div>
              <h3>Paramètres</h3>
              <p>Configurer l'établissement</p>
            </Link>

            <Link href="/admin/classes" className={styles.actionCard}>
              <div className={styles.actionIcon}>📚</div>
              <h3>Classes</h3>
              <p>Gérer les classes</p>
            </Link>

            <Link href="/admin/teachers" className={styles.actionCard}>
              <div className={styles.actionIcon}>👨‍🏫</div>
              <h3>Enseignants</h3>
              <p>Gérer les enseignants</p>
            </Link>

            <Link href="/admin/students" className={styles.actionCard}>
              <div className={styles.actionIcon}>👶</div>
              <h3>Élèves & Parents</h3>
              <p>Gérer les élèves et parents</p>
            </Link>

            <Link href="/admin/import" className={styles.actionCard}>
              <div className={styles.actionIcon}>📥</div>
              <h3>Importer</h3>
              <p>Importer via Excel</p>
            </Link>

            <Link href="/admin/comments" className={styles.actionCard}>
              <div className={styles.actionIcon}>💬</div>
              <h3>Commentaires</h3>
              <p>Consulter tous les commentaires</p>
            </Link>
          </div>
        </section>

        <section className={styles.infoSection}>
          <h3>Année scolaire actuelle</h3>
          <p className={styles.highlight}>{settings?.school_year}</p>

          {settings?.school_name && (
            <>
              <h3>Établissement</h3>
              <p>{settings.school_name}</p>
            </>
          )}

          {settings?.contact_email && (
            <>
              <h3>Contact</h3>
              <p>Email: {settings.contact_email}</p>
              {settings.contact_phone && <p>Téléphone: {settings.contact_phone}</p>}
            </>
          )}
        </section>
      </main>
    </div>
  );
}
