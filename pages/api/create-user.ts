import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import { signOut } from '@/lib/auth';
import styles from '@/styles/admin.module.css';

export default function AdminTeachers() {
  const router = useRouter();
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    classes: [] as number[],
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
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

      const { data: teachersData } = await supabase
        .from('enseignants')
        .select('*, profile:profiles(id, nom, prenom)')
        .order('nom');

      if (teachersData) {
        setTeachers(teachersData);
      }

      const { data: classesData } = await supabase
        .from('classes')
        .select('*')
        .order('nom_classe');

      if (classesData) {
        setClasses(classesData);
      }

      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClassToggle = (classId: number) => {
    setFormData((prev) => ({
      ...prev,
      classes: prev.classes.includes(classId)
        ? prev.classes.filter((c) => c !== classId)
        : [...prev.classes, classId],
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      // ✅ UTILISER L'API ROUTE AU LIEU DE signUp()
      const res = await fetch('/api/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          nom: formData.nom,
          prenom: formData.prenom,
          role: 'teacher',
        }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        setMessage('❌ Erreur: ' + (result.error || 'Impossible de créer l\'utilisateur'));
        setSaving(false);
        return;
      }

      const userId = result.user_id;

      await supabase.from('profiles').insert([{
        id: userId,
        nom: formData.nom,
        prenom: formData.prenom,
        role: 'teacher',
      }]);

      const { data: teacherData } = await supabase
        .from('enseignants')
        .insert([{
          user_id: userId,
          nom: formData.nom,
          prenom: formData.prenom,
        }])
        .select();

      if (teacherData && teacherData[0] && formData.classes.length > 0) {
        await supabase.from('enseignants_classes').insert(
          formData.classes.map((classId) => ({
            enseignant_id: teacherData[0].id,
            classe_id: classId,
          }))
        );
      }

      setMessage('✅ Enseignant créé avec succès');
      resetForm();

      const { data: updatedTeachers } = await supabase
        .from('enseignants')
        .select('*, profile:profiles(id, nom, prenom)')
        .order('nom');

      if (updatedTeachers) {
        setTeachers(updatedTeachers);
      }
    } catch (error) {
      console.error(error);
      setMessage('❌ Erreur lors de l\'opération');
    }

    setSaving(false);
  };

  const handleDelete = async (teacherId: number, profileId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet enseignant ?')) {
      try {
        await supabase.from('enseignants_classes').delete().eq('enseignant_id', teacherId);
        await supabase.from('enseignants').delete().eq('id', teacherId);
        await supabase.auth.admin.deleteUser(profileId);

        setTeachers(teachers.filter((t) => t.id !== teacherId));
        setMessage('Enseignant supprimé avec succès');
      } catch (error) {
        setMessage('Erreur lors de la suppression');
      }
    }
  };

  const resetForm = () => {
    setFormData({ nom: '', prenom: '', email: '', password: '', classes: [] });
    setShowForm(false);
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
        <h1>Gestion des enseignants</h1>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          Déconnexion
        </button>
      </header>

      <main className={styles.main}>
        {!showForm ? (
          <section className={styles.infoSection}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>Enseignants ({teachers.length})</h2>
              <button
                onClick={() => setShowForm(true)}
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                + Ajouter un enseignant
              </button>
            </div>

            {teachers.length > 0 ? (
              <div>
                {teachers.map((teacher) => (
                  <div
                    key={teacher.id}
                    style={{
                      background: '#f8f9fa',
                      padding: '15px',
                      marginBottom: '15px',
                      borderRadius: '8px',
                      borderLeft: '4px solid var(--color-primary)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <h4 style={{ margin: '0 0 5px 0' }}>
                        {teacher.prenom} {teacher.nom}
                      </h4>
                    </div>
                    <button
                      onClick={() => handleDelete(teacher.id, teacher.profile_id)}
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
                ))}
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: '#999' }}>Aucun enseignant créé</p>
            )}
          </section>
        ) : (
          <section className={styles.form} style={{ maxWidth: '600px' }}>
            <h2>Ajouter un enseignant</h2>

            <form onSubmit={handleSave}>
              <div className={styles.formGroup}>
                <label htmlFor="prenom">Prénom *</label>
                <input
                  id="prenom"
                  name="prenom"
                  type="text"
                  value={formData.prenom}
                  onChange={handleInputChange}
                  placeholder="Marie"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="nom">Nom *</label>
                <input
                  id="nom"
                  name="nom"
                  type="text"
                  value={formData.nom}
                  onChange={handleInputChange}
                  placeholder="Dupont"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email">Email *</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="marie.dupont@ecole.fr"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="password">Mot de passe *</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Mot de passe sécurisé"
                  required
                  minLength={8}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Classes associées</label>
                <div style={{ display: 'grid', gap: '10px' }}>
                  {classes.map((classe) => (
                    <label key={classe.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={formData.classes.includes(classe.id)}
                        onChange={() => handleClassToggle(classe.id)}
                      />
                      {classe.nom_classe} ({classe.niveau})
                    </label>
                  ))}
                </div>
              </div>

              {message && (
                <div
                  className={message.includes('✅') ? styles.successMessage : styles.errorMessage}
                >
                  {message}
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="submit"
                  disabled={saving}
                  className={styles.submitButton}
                  style={{ flex: 1 }}
                >
                  {saving ? 'Création...' : 'Créer l\'enseignant'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  style={{
                    flex: 1,
                    backgroundColor: '#6c757d',
                    color: 'white',
                    padding: '12px',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  Annuler
                </button>
              </div>
            </form>
          </section>
        )}
      </main>
    </div>
  );
}