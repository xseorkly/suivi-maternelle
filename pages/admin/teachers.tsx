import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import { signOut } from '@/lib/auth';
import styles from '@/styles/admin.module.css';

export default function AdminTeachers() {
  const router = useRouter();
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [teacherClasses, setTeacherClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  // États pour édition enseignant
  const [editingTeacher, setEditingTeacher] = useState<any>(null);
  const [editTeacherForm, setEditTeacherForm] = useState({ nom: '', prenom: '', classe_id: 0 });

  // États pour mot de passe
  const [passwordForm, setPasswordForm] = useState({ teacherId: 0, newPassword: '' });
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // États pour créer nouveau
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ nom: '', prenom: '', email: '', password: '', classe_id: 0 });

  // Charger les données
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

      // Charger enseignants
      const { data: teachersData } = await supabase
        .from('enseignants')
        .select('*')
        .order('nom');
      if (teachersData) setTeachers(teachersData);

      // Charger classes
      const { data: classesData } = await supabase
        .from('classes')
        .select('*')
        .order('nom_classe');
      if (classesData) setClasses(classesData);

      // Charger relations enseignants-classes
      const { data: relationsData } = await supabase
        .from('enseignants_classes')
        .select('*');
      if (relationsData) setTeacherClasses(relationsData);

      setLoading(false);
    };

    checkAuth();
  }, [router]);

  // ========== ENSEIGNANTS ==========

  const getTeacherClasses = (teacherId: number) => {
    const classIds = teacherClasses
      .filter(tc => tc.enseignant_id === teacherId)
      .map(tc => tc.classe_id);
    return classes.filter(c => classIds.includes(c.id));
  };

  const handleEditTeacher = (teacher: any) => {
    setEditingTeacher(teacher.id);
    const teacherClassesList = getTeacherClasses(teacher.id);
    setEditTeacherForm({
      nom: teacher.nom,
      prenom: teacher.prenom,
      classe_id: teacherClassesList.length > 0 ? teacherClassesList[0].id : 0,
    });
  };

  const handleSaveTeacherEdit = async (teacherId: number) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('enseignants')
        .update({ nom: editTeacherForm.nom, prenom: editTeacherForm.prenom })
        .eq('id', teacherId);

      if (error) {
        setMessage('❌ Erreur: ' + error.message);
      } else {
        // Mettre à jour la classe affectée
        if (editTeacherForm.classe_id > 0) {
          // Supprimer les anciennes affectations
          await supabase
            .from('enseignants_classes')
            .delete()
            .eq('enseignant_id', teacherId);

          // Ajouter la nouvelle affectation
          await supabase
            .from('enseignants_classes')
            .insert({
              enseignant_id: teacherId,
              classe_id: editTeacherForm.classe_id,
            });
        }

        setMessage('✅ Enseignant modifié');
        const { data } = await supabase.from('enseignants').select('*').order('nom');
        if (data) setTeachers(data);

        const { data: relationsData } = await supabase
          .from('enseignants_classes')
          .select('*');
        if (relationsData) setTeacherClasses(relationsData);

        setEditingTeacher(null);
      }
    } catch (err) {
      setMessage('❌ Erreur');
    }
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
      setMessage('❌ Le mot de passe doit faire au moins 6 caractères');
      return;
    }

    setSaving(true);
    try {
      const teacher = teachers.find(t => t.id === passwordForm.teacherId);
      if (!teacher) {
        setMessage('❌ Enseignant non trouvé');
        setSaving(false);
        return;
      }

      const { error } = await supabase.auth.admin.updateUserById(teacher.profile_id, {
        password: passwordForm.newPassword,
      });

      if (error) {
        setMessage('❌ Erreur: ' + error.message);
      } else {
        setMessage('✅ Mot de passe changé');
        setShowPasswordModal(false);
        setPasswordForm({ teacherId: 0, newPassword: '' });
      }
    } catch {
      setMessage('❌ Erreur');
    }
    setSaving(false);
  };

  const handleDeleteTeacher = async (teacherId: number, profileId: string) => {
    if (!confirm('Supprimer cet enseignant ?')) return;
    try {
      await supabase.from('enseignants_classes').delete().eq('enseignant_id', teacherId);
      await supabase.from('enseignants').delete().eq('id', teacherId);
      await supabase.auth.admin.deleteUser(profileId);
      setTeachers(teachers.filter(t => t.id !== teacherId));
      setMessage('✅ Enseignant supprimé');
    } catch {
      setMessage('❌ Erreur suppression');
    }
  };

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const res = await fetch('/api/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: addForm.email,
          password: addForm.password,
          nom: addForm.nom,
          prenom: addForm.prenom,
          role: 'enseignant',
        }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        setMessage('❌ Erreur: ' + (result.error || 'Impossible de créer l\'utilisateur'));
        setSaving(false);
        return;
      }

      const userId = result.user_id;

      const { data: teacherData, error: teacherError } = await supabase
        .from('enseignants')
        .insert([{
          profile_id: userId,
          nom: addForm.nom,
          prenom: addForm.prenom,
        }])
        .select();

      if (teacherError) {
        setMessage('❌ Erreur création enseignant: ' + teacherError.message);
        setSaving(false);
        return;
      }

      if (addForm.classe_id > 0 && teacherData && teacherData[0]) {
        await supabase
          .from('enseignants_classes')
          .insert({
            enseignant_id: teacherData[0].id,
            classe_id: addForm.classe_id,
          });
      }

      setMessage('✅ Enseignant créé');
      setAddForm({ nom: '', prenom: '', email: '', password: '', classe_id: 0 });
      setShowAddForm(false);

      const { data: updatedTeachers } = await supabase.from('enseignants').select('*').order('nom');
      if (updatedTeachers) setTeachers(updatedTeachers);

      const { data: relationsData } = await supabase.from('enseignants_classes').select('*');
      if (relationsData) setTeacherClasses(relationsData);
    } catch (error) {
      setMessage('❌ Erreur');
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
        <Link href="/admin/dashboard" className={styles.headerBack}>
          ← Tableau de bord
        </Link>
        <h1>Enseignants</h1>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          Déconnexion
        </button>
      </header>

      <main className={styles.main}>
        <section className={styles.infoSection}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Enseignants ({teachers.length})</h2>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {showAddForm ? '✕ Annuler' : '+ Ajouter un enseignant'}
            </button>
          </div>

          {showAddForm && (
            <div style={{ background: '#f0f0f0', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
              <h3>Ajouter un enseignant</h3>
              <form onSubmit={handleAddTeacher}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Prénom:</label>
                  <input
                    type="text"
                    value={addForm.prenom}
                    onChange={(e) => setAddForm({ ...addForm, prenom: e.target.value })}
                    placeholder="Prénom"
                    required
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Nom:</label>
                  <input
                    type="text"
                    value={addForm.nom}
                    onChange={(e) => setAddForm({ ...addForm, nom: e.target.value })}
                    placeholder="Nom"
                    required
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Email:</label>
                  <input
                    type="email"
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                    placeholder="Email"
                    required
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Mot de passe:</label>
                  <input
                    type="password"
                    value={addForm.password}
                    onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                    placeholder="Mot de passe"
                    required
                    minLength={6}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Classe affectée:</label>
                  <select
                    value={addForm.classe_id}
                    onChange={(e) => setAddForm({ ...addForm, classe_id: parseInt(e.target.value) })}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                  >
                    <option value={0}>-- Aucune classe --</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.nom_classe}</option>
                    ))}
                  </select>
                </div>
                {message && (
                  <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: message.includes('✅') ? '#d4edda' : '#f8d7da', borderRadius: '4px', color: message.includes('✅') ? '#155724' : '#721c24' }}>
                    {message}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{ flex: 1, backgroundColor: '#28a745', color: 'white', padding: '10px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    {saving ? 'Création...' : '✓ Créer'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    style={{ flex: 1, backgroundColor: '#6c757d', color: 'white', padding: '10px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    ✕ Annuler
                  </button>
                </div>
              </form>
            </div>
          )}

          {message && !showAddForm && (
            <div style={{ marginBottom: '20px', padding: '12px', borderRadius: '6px', backgroundColor: message.includes('✅') ? '#d4edda' : '#f8d7da', color: message.includes('✅') ? '#155724' : '#721c24' }}>
              {message}
            </div>
          )}

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
                  }}
                >
                  {editingTeacher === teacher.id ? (
                    <div>
                      <div style={{ marginBottom: '10px' }}>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Nom:</label>
                        <input
                          type="text"
                          value={editTeacherForm.nom}
                          onChange={(e) => setEditTeacherForm({ ...editTeacherForm, nom: e.target.value })}
                          placeholder="Nom"
                          style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                        />
                      </div>
                      <div style={{ marginBottom: '10px' }}>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Prénom:</label>
                        <input
                          type="text"
                          value={editTeacherForm.prenom}
                          onChange={(e) => setEditTeacherForm({ ...editTeacherForm, prenom: e.target.value })}
                          placeholder="Prénom"
                          style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                        />
                      </div>
                      <div style={{ marginBottom: '10px' }}>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Classe affectée:</label>
                        <select
                          value={editTeacherForm.classe_id}
                          onChange={(e) => setEditTeacherForm({ ...editTeacherForm, classe_id: parseInt(e.target.value) })}
                          style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                        >
                          <option value={0}>-- Aucune classe --</option>
                          {classes.map(c => (
                            <option key={c.id} value={c.id}>{c.nom_classe}</option>
                          ))}
                        </select>
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          onClick={() => handleSaveTeacherEdit(teacher.id)}
                          disabled={saving}
                          style={{ backgroundColor: '#28a745', color: 'white', padding: '8px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          ✓ Sauver
                        </button>
                        <button
                          onClick={() => setEditingTeacher(null)}
                          style={{ backgroundColor: '#6c757d', color: 'white', padding: '8px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          ✕ Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div>
                          <h4 style={{ margin: '0 0 5px 0' }}>
                            {teacher.prenom} {teacher.nom}
                          </h4>
                          <p style={{ margin: '5px 0', color: '#666', fontSize: '0.9rem' }}>
                            📚 Classe(s) affectée(s):
                          </p>
                          {getTeacherClasses(teacher.id).length > 0 ? (
                            <ul style={{ margin: '5px 0 0 20px', padding: 0 }}>
                              {getTeacherClasses(teacher.id).map(classe => (
                                <li key={classe.id} style={{ margin: '3px 0' }}>
                                  {classe.nom_classe}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p style={{ margin: '5px 0 0 20px', color: '#999' }}>Aucune classe affectée</p>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleEditTeacher(teacher)}
                            style={{
                              backgroundColor: '#007bff',
                              color: 'white',
                              padding: '6px 12px',
                              borderRadius: '4px',
                              border: 'none',
                              cursor: 'pointer',
                            }}
                          >
                            ✏️ Modifier
                          </button>
                          <button
                            onClick={() => {
                              setPasswordForm({ teacherId: teacher.id, newPassword: '' });
                              setShowPasswordModal(true);
                            }}
                            style={{
                              backgroundColor: '#ffc107',
                              color: 'black',
                              padding: '6px 12px',
                              borderRadius: '4px',
                              border: 'none',
                              cursor: 'pointer',
                            }}
                          >
                            🔐 Mot de passe
                          </button>
                          <button
                            onClick={() => handleDeleteTeacher(teacher.id, teacher.profile_id)}
                            style={{
                              backgroundColor: 'var(--color-tertiary)',
                              color: 'white',
                              padding: '6px 12px',
                              borderRadius: '4px',
                              border: 'none',
                              cursor: 'pointer',
                            }}
                          >
                            🗑️ Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: '#999' }}>Aucun enseignant créé</p>
          )}
        </section>
      </main>

      {/* Modal changement de mot de passe */}
      {showPasswordModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '8px',
              maxWidth: '400px',
              width: '90%',
            }}
          >
            <h3>Changer le mot de passe</h3>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              placeholder="Nouveau mot de passe"
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '15px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleChangePassword}
                disabled={saving}
                style={{
                  flex: 1,
                  backgroundColor: '#28a745',
                  color: 'white',
                  padding: '10px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                ✓ Changer
              </button>
              <button
                onClick={() => setShowPasswordModal(false)}
                style={{
                  flex: 1,
                  backgroundColor: '#6c757d',
                  color: 'white',
                  padding: '10px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                ✕ Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
