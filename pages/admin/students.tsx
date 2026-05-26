import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import { signOut } from '@/lib/auth';
import styles from '@/styles/admin.module.css';

export default function AdminStudents() {
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [parents, setParents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'students' | 'parents'>('students');
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const [studentForm, setStudentForm] = useState({
    nom: '',
    prenom: '',
    classe_id: 0,
  });

  const [parentForm, setParentForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    eleves: [] as number[],
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

      const { data: studentsData } = await supabase
        .from('eleves')
        .select('*')
        .order('nom');
      if (studentsData) setStudents(studentsData);

      const { data: parentsData } = await supabase
        .from('parents')
        .select('*')
        .order('nom');
      if (parentsData) setParents(parentsData);

      const { data: classesData } = await supabase
        .from('classes')
        .select('*')
        .order('nom_classe');
      if (classesData) setClasses(classesData);

      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const handleStudentInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setStudentForm((prev) => ({
      ...prev,
      [name]: name === 'classe_id' ? parseInt(value) : value,
    }));
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const { data, error } = await supabase
        .from('eleves')
        .insert([
          {
            nom: studentForm.nom,
            prenom: studentForm.prenom,
            classe_id: studentForm.classe_id,
          },
        ])
        .select();

      if (error) {
        setMessage('❌ Erreur: ' + error.message);
        setSaving(false);
        return;
      }

      setMessage('✅ Élève créé avec succès');
      setStudentForm({ nom: '', prenom: '', classe_id: 0 });
      setShowForm(false);

      const { data: updatedStudents } = await supabase
        .from('eleves')
        .select('*')
        .order('nom');
      if (updatedStudents) setStudents(updatedStudents);
    } catch (error) {
      setMessage('❌ Erreur lors de l\'opération');
    }

    setSaving(false);
  };

  const handleDeleteStudent = async (studentId: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet élève ?')) {
      try {
        await supabase.from('parents_eleves').delete().eq('eleve_id', studentId);
        await supabase.from('eleves').delete().eq('id', studentId);

        setStudents(students.filter((s) => s.id !== studentId));
        setMessage('Élève supprimé avec succès');
      } catch (error) {
        setMessage('Erreur lors de la suppression');
      }
    }
  };

  const handleParentInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setParentForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEleveToggle = (eleveId: number) => {
    setParentForm((prev) => ({
      ...prev,
      eleves: prev.eleves.includes(eleveId)
        ? prev.eleves.filter((e) => e !== eleveId)
        : [...prev.eleves, eleveId],
    }));
  };

  const handleSaveParent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const res = await fetch('/api/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: parentForm.email,
          password: parentForm.password,
          nom: parentForm.nom,
          prenom: parentForm.prenom,
          role: 'parent',
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
        nom: parentForm.nom,
        prenom: parentForm.prenom,
        role: 'parent',
      }]);

      const { data: parentData } = await supabase
        .from('parents')
        .insert([{
          user_id: userId,
          nom: parentForm.nom,
          prenom: parentForm.prenom,
        }])
        .select();

      if (parentData && parentData[0] && parentForm.eleves.length > 0) {
        await supabase.from('parents_eleves').insert(
          parentForm.eleves.map((eleveId) => ({
            parent_id: parentData[0].id,
            eleve_id: eleveId,
            lien_parental: 'Parent',
          }))
        );
      }

      setMessage('✅ Parent créé avec succès');
      setParentForm({ nom: '', prenom: '', email: '', password: '', eleves: [] });
      setShowForm(false);

      const { data: updatedParents } = await supabase
        .from('parents')
        .select('*')
        .order('nom');
      if (updatedParents) setParents(updatedParents);
    } catch (error) {
      console.error(error);
      setMessage('❌ Erreur lors de l\'opération');
    }

    setSaving(false);
  };

  const handleDeleteParent = async (parentId: number, userId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce parent ?')) {
      try {
        await supabase.from('parents_eleves').delete().eq('parent_id', parentId);
        await supabase.from('parents').delete().eq('id', parentId);
        await supabase.auth.admin.deleteUser(userId);

        setParents(parents.filter((p) => p.id !== parentId));
        setMessage('Parent supprimé avec succès');
      } catch (error) {
        setMessage('Erreur lors de la suppression');
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
        <h1>Élèves & Parents</h1>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          Déconnexion
        </button>
      </header>

      <main className={styles.main}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
          <button
            onClick={() => {
              setActiveTab('students');
              setShowForm(false);
            }}
            style={{
              backgroundColor: activeTab === 'students' ? 'var(--color-primary)' : '#ddd',
              color: activeTab === 'students' ? 'white' : 'black',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Élèves
          </button>
          <button
            onClick={() => {
              setActiveTab('parents');
              setShowForm(false);
            }}
            style={{
              backgroundColor: activeTab === 'parents' ? 'var(--color-primary)' : '#ddd',
              color: activeTab === 'parents' ? 'white' : 'black',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Parents
          </button>
        </div>

        {activeTab === 'students' && (
          <>
            {!showForm ? (
              <section className={styles.infoSection}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2>Élèves ({students.length})</h2>
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
                    + Ajouter un élève
                  </button>
                </div>

                {students.length > 0 ? (
                  <div>
                    {students.map((student) => (
                      <div
                        key={student.id}
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
                            {student.prenom} {student.nom}
                          </h4>
                          <p style={{ margin: '0', color: '#666', fontSize: '0.9rem' }}>
                            Classe: {classes.find((c) => c.id === student.classe_id)?.nom_classe || 'N/A'}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteStudent(student.id)}
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
                  <p style={{ textAlign: 'center', color: '#999' }}>Aucun élève créé</p>
                )}
              </section>
            ) : (
              <section className={styles.form} style={{ maxWidth: '600px' }}>
                <h2>Ajouter un élève</h2>

                <form onSubmit={handleSaveStudent}>
                  <div className={styles.formGroup}>
                    <label htmlFor="prenom">Prénom *</label>
                    <input
                      id="prenom"
                      name="prenom"
                      type="text"
                      value={studentForm.prenom}
                      onChange={handleStudentInputChange}
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
                      value={studentForm.nom}
                      onChange={handleStudentInputChange}
                      placeholder="Dupont"
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="classe_id">Classe *</label>
                    <select
                      id="classe_id"
                      name="classe_id"
                      value={studentForm.classe_id}
                      onChange={handleStudentInputChange}
                      required
                    >
                      <option value={0}>Sélectionner une classe</option>
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nom_classe} ({c.niveau})
                        </option>
                      ))}
                    </select>
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
                      {saving ? 'Création...' : 'Créer l\'élève'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setMessage('');
                      }}
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
          </>
        )}

        {activeTab === 'parents' && (
          <>
            {!showForm ? (
              <section className={styles.infoSection}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2>Parents ({parents.length})</h2>
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
                    + Ajouter un parent
                  </button>
                </div>

                {parents.length > 0 ? (
                  <div>
                    {parents.map((parent) => (
                      <div
                        key={parent.id}
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
                            {parent.prenom} {parent.nom}
                          </h4>
                        </div>
                        <button
                          onClick={() => handleDeleteParent(parent.id, parent.user_id)}
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
                  <p style={{ textAlign: 'center', color: '#999' }}>Aucun parent créé</p>
                )}
              </section>
            ) : (
              <section className={styles.form} style={{ maxWidth: '600px' }}>
                <h2>Ajouter un parent</h2>

                <form onSubmit={handleSaveParent}>
                  <div className={styles.formGroup}>
                    <label htmlFor="parent_prenom">Prénom *</label>
                    <input
                      id="parent_prenom"
                      name="prenom"
                      type="text"
                      value={parentForm.prenom}
                      onChange={handleParentInputChange}
                      placeholder="Jean"
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="parent_nom">Nom *</label>
                    <input
                      id="parent_nom"
                      name="nom"
                      type="text"
                      value={parentForm.nom}
                      onChange={handleParentInputChange}
                      placeholder="Dupont"
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="parent_email">Email *</label>
                    <input
                      id="parent_email"
                      name="email"
                      type="email"
                      value={parentForm.email}
                      onChange={handleParentInputChange}
                      placeholder="jean.dupont@email.com"
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="parent_password">Mot de passe *</label>
                    <input
                      id="parent_password"
                      name="password"
                      type="password"
                      value={parentForm.password}
                      onChange={handleParentInputChange}
                      placeholder="Mot de passe sécurisé"
                      required
                      minLength={8}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Élèves associés</label>
                    <div style={{ display: 'grid', gap: '10px' }}>
                      {students.length > 0 ? (
                        students.map((student) => (
                          <label key={student.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={parentForm.eleves.includes(student.id)}
                              onChange={() => handleEleveToggle(student.id)}
                            />
                            {student.prenom} {student.nom}
                          </label>
                        ))
                      ) : (
                        <p style={{ color: '#999' }}>Aucun élève disponible</p>
                      )}
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
                      {saving ? 'Création...' : 'Créer le parent'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setMessage('');
                      }}
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
          </>
        )}
      </main>
    </div>
  );
}