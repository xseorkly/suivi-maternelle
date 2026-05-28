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
          </div>

          {message && (
            <div
              style={{
                marginBottom: '20px',
                padding: '12px',
                borderRadius: '6px',
                backgroundColor: message.includes('✅') ? '#d4edda' : '#f8d7da',
                color: message.includes('✅') ? '#155724' : '#721c24',
              }}
            >
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
                    // Mode édition
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
                    // Mode affichage
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
