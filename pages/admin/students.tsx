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
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<'student' | 'parent' | 'associate'>('student');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const [studentForm, setStudentForm] = useState({
    nom: '',
    prenom: '',
    classe_id: '',
  });

  const [parentForm, setParentForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
  });

  const [associateForm, setAssociateForm] = useState({
    student_id: '',
    parent_id: '',
    lien_parental: 'mère',
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

      // Récupérer les élèves
      const { data: studentsData } = await supabase
        .from('eleves')
        .select('*, classes(nom_classe, niveau)')
        .order('nom');

      if (studentsData) {
        setStudents(studentsData);
      }

      // Récupérer les parents
      const { data: parentsData } = await supabase
        .from('parents')
        .select('*')
        .order('nom');

      if (parentsData) {
        setParents(parentsData);
      }

      // Récupérer les classes
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

  const handleStudentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setStudentForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleParentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setParentForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAssociateChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAssociateForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { data, error } = await supabase
        .from('eleves')
        .insert([
          {
            nom: studentForm.nom,
            prenom: studentForm.prenom,
            classe_id: parseInt(studentForm.classe_id),
          },
        ])
        .select('*, classes(nom_classe, niveau)');

      if (error) {
        setMessage('Erreur lors de la création');
      } else {
        setMessage('Élève créé avec succès');
        if (data) {
          setStudents([...students, data[0]]);
        }
        setStudentForm({ nom: '', prenom: '', classe_id: '' });
      }
    } catch (error) {
      setMessage('Erreur lors de l\'opération');
    }

    setSaving(false);
  };

  const handleAddParent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: parentForm.email,
        password: parentForm.password,
        options: {
          data: {
            nom: parentForm.nom,
            prenom: parentForm.prenom,
            role: 'parent',
          },
        },
      });

      if (authError || !authData.user) {
        setMessage('Erreur lors de la création du compte');
        setSaving(false);
        return;
      }

      await supabase.from('profiles').insert([
        {
          id: authData.user.id,
          nom: parentForm.nom,
          prenom: parentForm.prenom,
          role: 'parent',
        },
      ]);

      const { data, error } = await supabase
        .from('parents')
        .insert([
          {
            profile_id: authData.user.id,
            nom: parentForm.nom,
            prenom: parentForm.prenom,
          },
        ])
        .select();

      if (error) {
        setMessage('Erreur lors de la création du parent');
      } else {
        setMessage('Parent créé avec succès');
        if (data) {
          setParents([...parents, data[0]]);
        }
        setParentForm({ nom: '', prenom: '', email: '', password: '' });
      }
    } catch (error) {
      setMessage('Erreur lors de l\'opération');
    }

    setSaving(false);
  };

  const handleAssociate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase.from('parents_eleves').insert([
        {
          parent_id: parseInt(associateForm.parent_id),
          eleve_id: parseInt(associateForm.student_id),
          lien_parental: associateForm.lien_parental,
        },
      ]);

      if (error) {
        setMessage('Erreur lors de l\'association');
      } else {
        setMessage('Parent associé avec succès');
        setAssociateForm({ student_id: '', parent_id: '', lien_parental: 'mère' });
      }
    } catch (error) {
      setMessage('Erreur lors de l\'opération');
    }

    setSaving(false);
  };

  const handleDeleteStudent = async (id: number) => {
    if (confirm('Êtes-vous sûr ?')) {
      await supabase.from('eleves').delete().eq('id', id);
      setStudents(students.filter((s) => s.id !== id));
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
        {!showForm ? (
          <>
            <section className={styles.infoSection}>
              <div style={{ marginBottom: '20px' }}>
                <h2>Élèves ({students.length})</h2>
                <button
                  onClick={() => {
                    setFormMode('student');
                    setShowForm(true);
                  }}
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    color: 'white',
                    padding: '10px 20px',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    marginBottom: '15px',
                  }}
                >
                  + Ajouter un élève
                </button>

                {students.length > 0 ? (
                  <div style={{ overflow: 'x' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                          <th style={{ textAlign: 'left', padding: '12px' }}>Nom</th>
                          <th style={{ textAlign: 'left', padding: '12px' }}>Classe</th>
                          <th style={{ textAlign: 'center', padding: '12px' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((student) => (
                          <tr
                            key={student.id}
                            style={{ borderBottom: '1px solid var(--color-border)' }}
                          >
                            <td style={{ padding: '12px' }}>
                              {student.prenom} {student.nom}
                            </td>
                            <td style={{ padding: '12px' }}>
                              {student.classes?.nom_classe}
                            </td>
                            <td style={{ textAlign: 'center', padding: '12px' }}>
                              <button
                                onClick={() => handleDeleteStudent(student.id)}
                                style={{
                                  backgroundColor: 'var(--color-tertiary)',
                                  color: 'white',
                                  padding: '5px 10px',
                                  borderRadius: '4px',
                                  border: 'none',
                                  cursor: 'pointer',
                                  fontSize: '0.85rem',
                                }}
                              >
                                Supprimer
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p style={{ color: '#999' }}>Aucun élève</p>
                )}
              </div>
            </section>

            <section className={styles.infoSection}>
              <div style={{ marginBottom: '20px' }}>
                <h2>Parents ({parents.length})</h2>
                <button
                  onClick={() => {
                    setFormMode('parent');
                    setShowForm(true);
                  }}
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    color: 'white',
                    padding: '10px 20px',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    marginBottom: '15px',
                  }}
                >
                  + Ajouter un parent
                </button>

                {parents.length > 0 ? (
                  <div>
                    {parents.map((parent) => (
                      <div
                        key={parent.id}
                        style={{
                          background: '#f8f9fa',
                          padding: '12px',
                          marginBottom: '10px',
                          borderRadius: '6px',
                          borderLeft: '4px solid var(--color-primary)',
                        }}
                      >
                        {parent.prenom} {parent.nom}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#999' }}>Aucun parent</p>
                )}
              </div>
            </section>

            <section className={styles.infoSection}>
              <h2>Associer parent & élève</h2>
              <button
                onClick={() => {
                  setFormMode('associate');
                  setShowForm(true);
                }}
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Créer une association
              </button>
            </section>
          </>
        ) : (
          <section className={styles.form} style={{ maxWidth: '600px' }}>
            {formMode === 'student' && (
              <form onSubmit={handleAddStudent}>
                <h2>Ajouter un élève</h2>
                <div className={styles.formGroup}>
                  <label>Prénom *</label>
                  <input
                    type="text"
                    value={studentForm.prenom}
                    onChange={(e) => setStudentForm({ ...studentForm, prenom: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Nom *</label>
                  <input
                    type="text"
                    value={studentForm.nom}
                    onChange={(e) => setStudentForm({ ...studentForm, nom: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Classe *</label>
                  <select
                    value={studentForm.classe_id}
                    onChange={(e) => setStudentForm({ ...studentForm, classe_id: e.target.value })}
                    required
                  >
                    <option value="">-- Sélectionner --</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nom_classe}
                      </option>
                    ))}
                  </select>
                </div>
                {message && <div className={styles.successMessage}>{message}</div>}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" disabled={saving} className={styles.submitButton} style={{ flex: 1 }}>
                    {saving ? 'Création...' : 'Ajouter l\'élève'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
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
                    Retour
                  </button>
                </div>
              </form>
            )}

            {formMode === 'parent' && (
              <form onSubmit={handleAddParent}>
                <h2>Ajouter un parent</h2>
                <div className={styles.formGroup}>
                  <label>Prénom *</label>
                  <input
                    type="text"
                    value={parentForm.prenom}
                    onChange={(e) => setParentForm({ ...parentForm, prenom: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Nom *</label>
                  <input
                    type="text"
                    value={parentForm.nom}
                    onChange={(e) => setParentForm({ ...parentForm, nom: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Email *</label>
                  <input
                    type="email"
                    value={parentForm.email}
                    onChange={(e) => setParentForm({ ...parentForm, email: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Mot de passe *</label>
                  <input
                    type="password"
                    value={parentForm.password}
                    onChange={(e) => setParentForm({ ...parentForm, password: e.target.value })}
                    required
                    minLength={8}
                  />
                </div>
                {message && <div className={styles.successMessage}>{message}</div>}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" disabled={saving} className={styles.submitButton} style={{ flex: 1 }}>
                    {saving ? 'Création...' : 'Ajouter le parent'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
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
                    Retour
                  </button>
                </div>
              </form>
            )}

            {formMode === 'associate' && (
              <form onSubmit={handleAssociate}>
                <h2>Associer parent & élève</h2>
                <div className={styles.formGroup}>
                  <label>Élève *</label>
                  <select
                    value={associateForm.student_id}
                    onChange={(e) => setAssociateForm({ ...associateForm, student_id: e.target.value })}
                    required
                  >
                    <option value="">-- Sélectionner --</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.prenom} {s.nom}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Parent *</label>
                  <select
                    value={associateForm.parent_id}
                    onChange={(e) => setAssociateForm({ ...associateForm, parent_id: e.target.value })}
                    required
                  >
                    <option value="">-- Sélectionner --</option>
                    {parents.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.prenom} {p.nom}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Lien parental *</label>
                  <select
                    value={associateForm.lien_parental}
                    onChange={(e) => setAssociateForm({ ...associateForm, lien_parental: e.target.value })}
                  >
                    <option value="mère">Mère</option>
                    <option value="père">Père</option>
                    <option value="responsable légal">Responsable légal</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>
                {message && <div className={styles.successMessage}>{message}</div>}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" disabled={saving} className={styles.submitButton} style={{ flex: 1 }}>
                    {saving ? 'Association...' : 'Associer'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
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
                    Retour
                  </button>
                </div>
              </form>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
