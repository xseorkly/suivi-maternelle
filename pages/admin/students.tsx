import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import { signOut } from '@/lib/auth';
import styles from '@/styles/admin.module.css';

export default function AdminStudents() {
  const router = useRouter();
  const [students, setStudents] = useState<any[]>([]);
  const [parents, setParents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [parentsEleves, setParentsEleves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'students' | 'parents'>('students');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  // États pour édition élève
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [editStudentForm, setEditStudentForm] = useState({ nom: '', prenom: '', classe_id: 0 });

  // États pour édition parent
  const [editingParent, setEditingParent] = useState<any>(null);
  const [editParentForm, setEditParentForm] = useState({ nom: '', prenom: '' });
  const [passwordForm, setPasswordForm] = useState({ parentId: 0, newPassword: '' });
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // États pour créer nouveau
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ nom: '', prenom: '', classe_id: 0, email: '', password: '', eleves: [] as number[] });

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

      // Charger élèves
      const { data: studentsData } = await supabase
        .from('eleves')
        .select('*')
        .order('nom');
      if (studentsData) setStudents(studentsData);

      // Charger parents
      const { data: parentsData } = await supabase
        .from('parents')
        .select('*')
        .order('nom');
      if (parentsData) setParents(parentsData);

      // Charger classes
      const { data: classesData } = await supabase
        .from('classes')
        .select('*')
        .order('nom_classe');
      if (classesData) setClasses(classesData);

      // Charger relations parents-élèves
      const { data: relationsData } = await supabase
        .from('parents_eleves')
        .select('*');
      if (relationsData) setParentsEleves(relationsData);

      setLoading(false);
    };

    checkAuth();
  }, [router]);

  // ========== ÉLÈVES ==========

  const getStudentParents = (studentId: number) => {
    const parentIds = parentsEleves
      .filter(pe => pe.eleve_id === studentId)
      .map(pe => pe.parent_id);
    return parents.filter(p => parentIds.includes(p.id));
  };

  const handleEditStudent = (student: any) => {
    setEditingStudent(student.id);
    setEditStudentForm({ nom: student.nom, prenom: student.prenom, classe_id: student.classe_id });
  };

  const handleSaveStudentEdit = async (studentId: number) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('eleves')
        .update({ nom: editStudentForm.nom, prenom: editStudentForm.prenom, classe_id: editStudentForm.classe_id })
        .eq('id', studentId);

      if (error) {
        setMessage('❌ Erreur: ' + error.message);
      } else {
        setMessage('✅ Élève modifié');
        const { data } = await supabase.from('eleves').select('*').order('nom');
        if (data) setStudents(data);
        setEditingStudent(null);
      }
    } catch (err) {
      setMessage('❌ Erreur');
    }
    setSaving(false);
  };

  const handleDeleteStudent = async (studentId: number) => {
    if (!confirm('Supprimer cet élève ?')) return;
    try {
      await supabase.from('parents_eleves').delete().eq('eleve_id', studentId);
      await supabase.from('eleves').delete().eq('id', studentId);
      setStudents(students.filter(s => s.id !== studentId));
      setMessage('✅ Élève supprimé');
    } catch {
      setMessage('❌ Erreur suppression');
    }
  };

  // ========== PARENTS ==========

  const getParentStudents = (parentId: number) => {
    const studentIds = parentsEleves
      .filter(pe => pe.parent_id === parentId)
      .map(pe => pe.eleve_id);
    return students.filter(s => studentIds.includes(s.id));
  };

  const handleEditParent = (parent: any) => {
    setEditingParent(parent.id);
    setEditParentForm({ nom: parent.nom, prenom: parent.prenom });
  };

  const handleSaveParentEdit = async (parentId: number) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('parents')
        .update({ nom: editParentForm.nom, prenom: editParentForm.prenom })
        .eq('id', parentId);

      if (error) {
        setMessage('❌ Erreur: ' + error.message);
      } else {
        setMessage('✅ Parent modifié');
        const { data } = await supabase.from('parents').select('*').order('nom');
        if (data) setParents(data);
        setEditingParent(null);
      }
    } catch {
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
      const parent = parents.find(p => p.id === passwordForm.parentId);
      if (!parent) {
        setMessage('❌ Parent non trouvé');
        setSaving(false);
        return;
      }

      const { error } = await supabase.auth.admin.updateUserById(parent.profile_id, {
        password: passwordForm.newPassword,
      });

      if (error) {
        setMessage('❌ Erreur: ' + error.message);
      } else {
        setMessage('✅ Mot de passe changé');
        setShowPasswordModal(false);
        setPasswordForm({ parentId: 0, newPassword: '' });
      }
    } catch {
      setMessage('❌ Erreur');
    }
    setSaving(false);
  };

  const handleDeleteParent = async (parentId: number, profileId: string) => {
    if (!confirm('Supprimer ce parent ?')) return;
    try {
      await supabase.from('parents_eleves').delete().eq('parent_id', parentId);
      await supabase.from('parents').delete().eq('id', parentId);
      await supabase.auth.admin.deleteUser(profileId);
      setParents(parents.filter(p => p.id !== parentId));
      setMessage('✅ Parent supprimé');
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
        <h1>Élèves & Parents</h1>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          Déconnexion
        </button>
      </header>

      <main className={styles.main}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
          <button
            onClick={() => {
              setActiveTab('students');
              setShowAddForm(false);
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
              setShowAddForm(false);
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

        {/* ===== TAB ÉLÈVES ===== */}
        {activeTab === 'students' && (
          <section className={styles.infoSection}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>Élèves ({students.length})</h2>
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
                {showAddForm ? '✕ Annuler' : '+ Ajouter'}
              </button>
            </div>

            {showAddForm && (
              <div style={{ background: '#f0f0f0', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                <h3>Ajouter un élève</h3>
                {/* Formulaire ajout simple pour ne pas compliquer */}
              </div>
            )}

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
                    }}
                  >
                    {editingStudent === student.id ? (
                      // Mode édition
                      <div>
                        <input
                          type="text"
                          value={editStudentForm.nom}
                          onChange={(e) => setEditStudentForm({ ...editStudentForm, nom: e.target.value })}
                          placeholder="Nom"
                          style={{ marginRight: '10px', padding: '5px' }}
                        />
                        <input
                          type="text"
                          value={editStudentForm.prenom}
                          onChange={(e) => setEditStudentForm({ ...editStudentForm, prenom: e.target.value })}
                          placeholder="Prénom"
                          style={{ marginRight: '10px', padding: '5px' }}
                        />
                        <select
                          value={editStudentForm.classe_id}
                          onChange={(e) => setEditStudentForm({ ...editStudentForm, classe_id: parseInt(e.target.value) })}
                          style={{ marginRight: '10px', padding: '5px' }}
                        >
                          {classes.map(c => (
                            <option key={c.id} value={c.id}>{c.nom_classe}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleSaveStudentEdit(student.id)}
                          disabled={saving}
                          style={{ backgroundColor: '#28a745', color: 'white', padding: '5px 10px', border: 'none', borderRadius: '4px', marginRight: '5px' }}
                        >
                          ✓ Sauver
                        </button>
                        <button
                          onClick={() => setEditingStudent(null)}
                          style={{ backgroundColor: '#6c757d', color: 'white', padding: '5px 10px', border: 'none', borderRadius: '4px' }}
                        >
                          ✕ Annuler
                        </button>
                      </div>
                    ) : (
                      // Mode affichage
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                          <div>
                            <h4 style={{ margin: '0 0 5px 0' }}>
                              {student.prenom} {student.nom}
                            </h4>
                            <p style={{ margin: '5px 0', color: '#666', fontSize: '0.9rem' }}>
                              📚 Classe: {classes.find(c => c.id === student.classe_id)?.nom_classe || 'N/A'}
                            </p>
                            <p style={{ margin: '5px 0', color: '#666', fontSize: '0.9rem' }}>
                              👨‍👩‍👧 Parents:
                            </p>
                            {getStudentParents(student.id).length > 0 ? (
                              <ul style={{ margin: '5px 0 0 20px', padding: 0 }}>
                                {getStudentParents(student.id).map(parent => (
                                  <li key={parent.id} style={{ margin: '3px 0' }}>
                                    {parent.prenom} {parent.nom}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p style={{ margin: '5px 0 0 20px', color: '#999' }}>Aucun parent</p>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: '5px' }}>
                            <button
                              onClick={() => handleEditStudent(student)}
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
                              onClick={() => handleDeleteStudent(student.id)}
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
              <p style={{ textAlign: 'center', color: '#999' }}>Aucun élève créé</p>
            )}
          </section>
        )}

        {/* ===== TAB PARENTS ===== */}
        {activeTab === 'parents' && (
          <section className={styles.infoSection}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>Parents ({parents.length})</h2>
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
                {showAddForm ? '✕ Annuler' : '+ Ajouter'}
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
                    }}
                  >
                    {editingParent === parent.id ? (
                      // Mode édition nom/prénom
                      <div>
                        <input
                          type="text"
                          value={editParentForm.nom}
                          onChange={(e) => setEditParentForm({ ...editParentForm, nom: e.target.value })}
                          placeholder="Nom"
                          style={{ marginRight: '10px', padding: '5px' }}
                        />
                        <input
                          type="text"
                          value={editParentForm.prenom}
                          onChange={(e) => setEditParentForm({ ...editParentForm, prenom: e.target.value })}
                          placeholder="Prénom"
                          style={{ marginRight: '10px', padding: '5px' }}
                        />
                        <button
                          onClick={() => handleSaveParentEdit(parent.id)}
                          disabled={saving}
                          style={{ backgroundColor: '#28a745', color: 'white', padding: '5px 10px', border: 'none', borderRadius: '4px', marginRight: '5px' }}
                        >
                          ✓ Sauver
                        </button>
                        <button
                          onClick={() => setEditingParent(null)}
                          style={{ backgroundColor: '#6c757d', color: 'white', padding: '5px 10px', border: 'none', borderRadius: '4px' }}
                        >
                          ✕ Annuler
                        </button>
                      </div>
                    ) : (
                      // Mode affichage
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                          <div>
                            <h4 style={{ margin: '0 0 5px 0' }}>
                              {parent.prenom} {parent.nom}
                            </h4>
                            <p style={{ margin: '5px 0', color: '#666', fontSize: '0.9rem' }}>
                              👧 Élèves rattachés:
                            </p>
                            {getParentStudents(parent.id).length > 0 ? (
                              <ul style={{ margin: '5px 0 0 20px', padding: 0 }}>
                                {getParentStudents(parent.id).map(student => (
                                  <li key={student.id} style={{ margin: '3px 0' }}>
                                    {student.prenom} {student.nom}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p style={{ margin: '5px 0 0 20px', color: '#999' }}>Aucun élève</p>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => handleEditParent(parent)}
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
                                setPasswordForm({ parentId: parent.id, newPassword: '' });
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
                              onClick={() => handleDeleteParent(parent.id, parent.profile_id)}
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
              <p style={{ textAlign: 'center', color: '#999' }}>Aucun parent créé</p>
            )}
          </section>
        )}
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
