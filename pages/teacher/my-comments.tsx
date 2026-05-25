import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase, getSettings } from '@/lib/supabase';
import { signOut } from '@/lib/auth';
import styles from '@/styles/admin.module.css';

export default function MyComments() {
  const router = useRouter();
  const [settings, setSettings] = useState(null);
  const [teacher, setTeacher] = useState(null);
  const [comments, setComments] = useState([]);
  const [filteredComments, setFilteredComments] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login/teacher');
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

        // Récupérer les classes
        const { data: classesData } = await supabase
          .from('enseignants_classes')
          .select('classe_id, classes(id, nom_classe, niveau)')
          .eq('enseignant_id', teacherData.id);

        if (classesData) {
          setClasses(classesData.map((c: any) => c.classes));
        }

        // Récupérer les commentaires
        const { data: commentsData } = await supabase
          .from('commentaires')
          .select('*, eleves(id, nom, prenom, classe_id)')
          .eq('enseignant_id', teacherData.id)
          .order('date_commentaire', { ascending: false });

        if (commentsData) {
          setComments(commentsData);
          setFilteredComments(commentsData);

          // Récupérer les élèves
          const { data: studentsData } = await supabase
            .from('eleves')
            .select('*')
            .in(
              'id',
              commentsData.map((c: any) => c.eleve_id)
            );

          if (studentsData) {
            setStudents(studentsData);
          }
        }
      }

      // Récupérer les settings
      const settingsData = await getSettings();
      if (settingsData) {
        setSettings(settingsData);
      }

      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const handleFilter = () => {
    let filtered = comments;

    if (selectedClass) {
      filtered = filtered.filter((c: any) => c.classe_id === parseInt(selectedClass));
    }

    if (selectedStudent) {
      filtered = filtered.filter((c: any) => c.eleve_id === parseInt(selectedStudent));
    }

    setFilteredComments(filtered);
  };

  const handleDelete = async (commentId: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) {
      const { error } = await supabase.from('commentaires').delete().eq('id', commentId);

      if (!error) {
        setComments(comments.filter((c: any) => c.id !== commentId));
        setFilteredComments(filteredComments.filter((c: any) => c.id !== commentId));
      }
    }
  };

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
        <Link href="/teacher/dashboard" className={styles.headerBack}>
          ← Tableau de bord
        </Link>
        <h1>Mes commentaires</h1>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          Déconnexion
        </button>
      </header>

      <main className={styles.main}>
        <section className={styles.formSection} style={{ background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '30px' }}>
          <h3>Filtrer les commentaires</h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div className={styles.formGroup} style={{ marginBottom: 0 }}>
              <label htmlFor="filter-class">Classe</label>
              <select
                id="filter-class"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                <option value="">Toutes les classes</option>
                {classes.map((classe: any) => (
                  <option key={classe.id} value={classe.id}>
                    {classe.nom_classe}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup} style={{ marginBottom: 0 }}>
              <label htmlFor="filter-student">Élève</label>
              <select
                id="filter-student"
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
              >
                <option value="">Tous les élèves</option>
                {students.map((student: any) => (
                  <option key={student.id} value={student.id}>
                    {student.prenom} {student.nom}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleFilter}
            style={{
              marginTop: '15px',
              backgroundColor: 'var(--color-primary)',
              color: 'white',
              padding: '10px 20px',
            }}
          >
            Appliquer les filtres
          </button>
        </section>

        <section className={styles.infoSection}>
          {filteredComments.length > 0 ? (
            <>
              <p style={{ marginBottom: '20px', color: '#666' }}>
                {filteredComments.length} commentaire(s)
              </p>
              {filteredComments.map((comment: any) => (
                <div
                  key={comment.id}
                  style={{
                    background: '#f8f9fa',
                    padding: '20px',
                    marginBottom: '20px',
                    borderRadius: '8px',
                    borderLeft: '4px solid var(--color-primary)',
                    position: 'relative',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <h4 style={{ marginBottom: '5px' }}>
                        {comment.eleves.prenom} {comment.eleves.nom}
                      </h4>
                      <p style={{ color: '#999', fontSize: '0.85rem', marginBottom: '10px' }}>
                        {new Date(comment.date_commentaire).toLocaleDateString('fr-FR')}
                      </p>
                      <p style={{ lineHeight: 1.8 }}>{comment.texte_commentaire}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(comment.id)}
                      style={{
                        background: 'var(--color-tertiary)',
                        color: 'white',
                        border: 'none',
                        padding: '8px 12px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                      }}
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <p style={{ textAlign: 'center', color: '#999' }}>Aucun commentaire correspondant</p>
          )}
        </section>
      </main>
    </div>
  );
}
