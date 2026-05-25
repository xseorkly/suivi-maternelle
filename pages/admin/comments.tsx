import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import { signOut } from '@/lib/auth';
import styles from '@/styles/admin.module.css';

export default function AdminComments() {
  const router = useRouter();
  const [comments, setComments] = useState([]);
  const [filteredComments, setFilteredComments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const [filters, setFilters] = useState({
    classe_id: '',
    enseignant_id: '',
    eleve_id: '',
    dateFrom: '',
    dateTo: '',
  });

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

      // Récupérer tous les commentaires
      const { data: commentsData } = await supabase
        .from('commentaires')
        .select(
          '*, eleves(id, nom, prenom), enseignants(id, nom, prenom), classes(nom_classe)'
        )
        .order('date_commentaire', { ascending: false });

      if (commentsData) {
        setComments(commentsData);
        setFilteredComments(commentsData);
      }

      // Récupérer les classes
      const { data: classesData } = await supabase
        .from('classes')
        .select('*')
        .order('nom_classe');

      if (classesData) {
        setClasses(classesData);
      }

      // Récupérer les enseignants
      const { data: teachersData } = await supabase
        .from('enseignants')
        .select('*')
        .order('nom');

      if (teachersData) {
        setTeachers(teachersData);
      }

      // Récupérer les élèves
      const { data: studentsData } = await supabase
        .from('eleves')
        .select('*')
        .order('nom');

      if (studentsData) {
        setStudents(studentsData);
      }

      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const applyFilters = () => {
    let filtered = comments;

    if (filters.classe_id) {
      filtered = filtered.filter((c: any) => c.classe_id === parseInt(filters.classe_id));
    }

    if (filters.enseignant_id) {
      filtered = filtered.filter((c: any) => c.enseignant_id === parseInt(filters.enseignant_id));
    }

    if (filters.eleve_id) {
      filtered = filtered.filter((c: any) => c.eleve_id === parseInt(filters.eleve_id));
    }

    if (filters.dateFrom) {
      filtered = filtered.filter((c: any) => c.date_commentaire >= filters.dateFrom);
    }

    if (filters.dateTo) {
      filtered = filtered.filter((c: any) => c.date_commentaire <= filters.dateTo);
    }

    setFilteredComments(filtered);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) {
      const { error } = await supabase.from('commentaires').delete().eq('id', id);

      if (!error) {
        setComments(comments.filter((c: any) => c.id !== id));
        setFilteredComments(filteredComments.filter((c: any) => c.id !== id));
        setMessage('Commentaire supprimé');
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
        <Link href="/admin/dashboard" className={styles.headerBack}>
          ← Tableau de bord
        </Link>
        <h1>Tous les commentaires</h1>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          Déconnexion
        </button>
      </header>

      <main className={styles.main}>
        <section className={styles.form} style={{ marginBottom: '30px' }}>
          <h2>Filtrer</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
            <div className={styles.formGroup} style={{ marginBottom: 0 }}>
              <label htmlFor="classe_id">Classe</label>
              <select
                id="classe_id"
                name="classe_id"
                value={filters.classe_id}
                onChange={handleFilterChange}
              >
                <option value="">Toutes</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nom_classe}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup} style={{ marginBottom: 0 }}>
              <label htmlFor="enseignant_id">Enseignant</label>
              <select
                id="enseignant_id"
                name="enseignant_id"
                value={filters.enseignant_id}
                onChange={handleFilterChange}
              >
                <option value="">Tous</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.prenom} {t.nom}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup} style={{ marginBottom: 0 }}>
              <label htmlFor="eleve_id">Élève</label>
              <select
                id="eleve_id"
                name="eleve_id"
                value={filters.eleve_id}
                onChange={handleFilterChange}
              >
                <option value="">Tous</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.prenom} {s.nom}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup} style={{ marginBottom: 0 }}>
              <label htmlFor="dateFrom">Date de</label>
              <input
                id="dateFrom"
                name="dateFrom"
                type="date"
                value={filters.dateFrom}
                onChange={handleFilterChange}
              />
            </div>

            <div className={styles.formGroup} style={{ marginBottom: 0 }}>
              <label htmlFor="dateTo">Date à</label>
              <input
                id="dateTo"
                name="dateTo"
                type="date"
                value={filters.dateTo}
                onChange={handleFilterChange}
              />
            </div>
          </div>

          <button
            onClick={applyFilters}
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Appliquer les filtres
          </button>
        </section>

        <section className={styles.infoSection}>
          <h2>Résultats ({filteredComments.length})</h2>

          {message && <div className={styles.successMessage}>{message}</div>}

          {filteredComments.length > 0 ? (
            <div>
              {filteredComments.map((comment: any) => (
                <div
                  key={comment.id}
                  style={{
                    background: '#f8f9fa',
                    padding: '20px',
                    marginBottom: '20px',
                    borderRadius: '8px',
                    borderLeft: '4px solid var(--color-primary)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                    <div>
                      <h4 style={{ margin: '0 0 5px 0' }}>
                        {comment.eleves?.prenom} {comment.eleves?.nom}
                      </h4>
                      <p style={{ margin: '0', color: '#666', fontSize: '0.85rem' }}>
                        Classe: {comment.classes?.nom_classe} | Enseignant: {comment.enseignants?.prenom}{' '}
                        {comment.enseignants?.nom}
                      </p>
                      <p style={{ margin: '5px 0 0 0', color: '#999', fontSize: '0.8rem' }}>
                        {new Date(comment.date_commentaire).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(comment.id)}
                      style={{
                        backgroundColor: 'var(--color-tertiary)',
                        color: 'white',
                        padding: '8px 15px',
                        borderRadius: '4px',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      Supprimer
                    </button>
                  </div>
                  <p style={{ lineHeight: 1.8, margin: 0 }}>{comment.texte_commentaire}</p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: '#999' }}>Aucun commentaire correspondant</p>
          )}
        </section>
      </main>
    </div>
  );
}
