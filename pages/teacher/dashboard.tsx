import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase, getSettings } from '@/lib/supabase';
import { signOut } from '@/lib/auth';
import styles from '@/styles/admin.module.css';

export default function TeacherDashboard() {
  const router = useRouter();
  const [settings, setSettings] = useState(null);
  const [teacher, setTeacher] = useState(null);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login/teacher');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!profile || profile.role !== 'enseignant') {
        router.push('/');
        return;
      }

      // Récupérer les données de l'enseignant
      const { data: teacherData } = await supabase
        .from('enseignants')
        .select('*')
        .eq('profile_id', user.id)
        .single();

      if (teacherData) {
        setTeacher(teacherData);

        // Récupérer les classes de cet enseignant
        const { data: classesData } = await supabase
          .from('enseignants_classes')
          .select('classe_id, classes(nom_classe, niveau)')
          .eq('enseignant_id', teacherData.id);

        if (classesData) {
          setClasses(classesData.map((c: any) => c.classes));
        }

        // Récupérer les élèves
        const { data: studentsData } = await supabase
          .from('eleves')
          .select('*')
          .in(
            'classe_id',
            classesData?.map((c: any) => c.classe_id) || []
          );

        if (studentsData) {
          setStudents(studentsData);
        }

        // Récupérer les commentaires de cet enseignant
        const { data: commentsData } = await supabase
          .from('commentaires')
          .select('*, eleves(nom, prenom)')
          .eq('enseignant_id', teacherData.id)
          .order('date_commentaire', { ascending: false })
          .limit(5);

        if (commentsData) {
          setComments(commentsData);
        }
      }

      // Récupérer les settings
      const settingsData = await getSettings();
      if (settingsData) {
        setSettings(settingsData);
        document.documentElement.style.setProperty('--color-primary', settingsData.primary_color);
      }

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
            <p>Espace enseignant</p>
          </div>
        </div>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          Déconnexion
        </button>
      </header>

      <main className={styles.main}>
        {teacher && (
          <>
            <h2>Bienvenue {teacher.prenom} {teacher.nom}</h2>
            <p style={{ marginBottom: '30px', color: '#666' }}>
              {settings?.welcome_text_teacher}
            </p>
          </>
        )}

        <section className={styles.statsSection}>
          <h2>Vos classes</h2>
          <div className={styles.statsGrid}>
            {classes.length > 0 ? (
              classes.map((classe, idx) => (
                <div key={idx} className={styles.statCard}>
                  <div className={styles.statNumber}>{classe.nom_classe}</div>
                  <div className={styles.statLabel}>{classe.niveau}</div>
                </div>
              ))
            ) : (
              <p>Aucune classe associée</p>
            )}
          </div>
        </section>

        <section className={styles.actionsSection}>
          <h2>Actions</h2>
          <div className={styles.actionsGrid}>
            <Link href="/teacher/add-comment" className={styles.actionCard}>
              <div className={styles.actionIcon}>✏️</div>
              <h3>Ajouter un commentaire</h3>
              <p>Saisir une observation</p>
            </Link>

            <Link href="/teacher/my-comments" className={styles.actionCard}>
              <div className={styles.actionIcon}>💬</div>
              <h3>Mes commentaires</h3>
              <p>Consulter mes observations</p>
            </Link>
          </div>
        </section>

        {comments.length > 0 && (
          <section className={styles.infoSection}>
            <h3>Derniers commentaires</h3>
            {comments.map((comment: any) => (
              <div
                key={comment.id}
                style={{
                  background: '#f8f9fa',
                  padding: '15px',
                  marginBottom: '15px',
                  borderRadius: '6px',
                  borderLeft: '4px solid var(--color-primary)',
                }}
              >
                <strong>
                  {comment.eleves.prenom} {comment.eleves.nom}
                </strong>
                <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '5px' }}>
                  {new Date(comment.date_commentaire).toLocaleDateString('fr-FR')}
                </p>
                <p>{comment.texte_commentaire}</p>
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
