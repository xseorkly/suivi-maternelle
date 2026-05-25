import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase, getSettings } from '@/lib/supabase';
import { signOut } from '@/lib/auth';
import styles from '@/styles/admin.module.css';

export default function AddComment() {
  const router = useRouter();
  const [settings, setSettings] = useState(null);
  const [teacher, setTeacher] = useState(null);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [commentDate, setCommentDate] = useState(new Date().toISOString().split('T')[0]);
  const [commentText, setCommentText] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
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

  const handleClassChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const classId = e.target.value;
    setSelectedClass(classId);
    setSelectedStudent('');

    if (classId) {
      // Récupérer les élèves de cette classe
      const { data: studentsData } = await supabase
        .from('eleves')
        .select('*')
        .eq('classe_id', parseInt(classId));

      if (studentsData) {
        setStudents(studentsData);
      }
    }
  };

  const handleSaveComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStudent || !commentText || !commentDate) {
      setMessage('Veuillez remplir tous les champs');
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase.from('commentaires').insert([
        {
          eleve_id: parseInt(selectedStudent),
          enseignant_id: teacher.id,
          classe_id: parseInt(selectedClass),
          date_commentaire: commentDate,
          texte_commentaire: commentText,
        },
      ]);

      if (error) {
        setMessage('Erreur lors de l\'enregistrement');
      } else {
        setMessage('Commentaire enregistré avec succès');
        setCommentText('');
        setSelectedStudent('');
        setCommentDate(new Date().toISOString().split('T')[0]);
      }
    } catch (error) {
      setMessage('Erreur lors de l\'enregistrement');
    }

    setSaving(false);
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
        <h1>Ajouter un commentaire</h1>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          Déconnexion
        </button>
      </header>

      <main className={styles.main}>
        <form onSubmit={handleSaveComment} className={styles.form}>
          <section className={styles.formSection}>
            <h2>Nouveau commentaire</h2>

            <div className={styles.formGroup}>
              <label htmlFor="comment-date">Date du commentaire *</label>
              <input
                id="comment-date"
                type="date"
                value={commentDate}
                onChange={(e) => setCommentDate(e.target.value)}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="class-select">Classe *</label>
              <select
                id="class-select"
                value={selectedClass}
                onChange={handleClassChange}
                required
              >
                <option value="">-- Sélectionner une classe --</option>
                {classes.map((classe: any) => (
                  <option key={classe.id} value={classe.id}>
                    {classe.nom_classe} ({classe.niveau})
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="student-select">Élève *</label>
              <select
                id="student-select"
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                disabled={!selectedClass}
                required
              >
                <option value="">-- Sélectionner un élève --</option>
                {students.map((student: any) => (
                  <option key={student.id} value={student.id}>
                    {student.prenom} {student.nom}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="comment-text">Commentaire *</label>
              <textarea
                id="comment-text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Saisir votre observation..."
                rows={6}
                required
              />
            </div>

            {message && (
              <div
                className={message.includes('succès') ? styles.successMessage : styles.errorMessage}
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className={styles.submitButton}
              style={{ marginTop: '20px' }}
            >
              {saving ? 'Enregistrement...' : 'Enregistrer le commentaire'}
            </button>
          </section>
        </form>
      </main>
    </div>
  );
}
