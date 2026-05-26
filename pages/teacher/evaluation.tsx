import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import { signOut } from '@/lib/auth';
import styles from '@/styles/admin.module.css';

const COMPETENCES = [
  { key: 'gestion_emotions', label: '😊 Je gère mes émotions' },
  { key: 'garder_calme', label: '🧘 Je garde mon calme' },
  { key: 'utiliser_mots', label: '💬 J\'utilise des mots pour dire ce qui me contrarie' },
  { key: 'demander_aide', label: '🙋 Je demande l\'aide d\'un adulte si je n\'arrive pas' },
  { key: 'vivre_ensemble', label: '👫 Je vis bien avec les autres' },
  { key: 'cooperer', label: '🤝 Je coopère avec les autres' },
  { key: 'respecter_autres', label: '🫱 Je respecte les autres enfants et les adultes' },
  { key: 'faire_travail', label: '📚 Je fais mon travail d\'élève' },
  { key: 'ecouter_consignes', label: '👂 J\'écoute les consignes' },
  { key: 'attendre_tour', label: '🚦 J\'attends mon tour pour participer' },
];

const NIVEAUX = [
  { value: 5, symbols: '☀️☀️☀️', label: 'Excellent !', color: '#4CAF50' },
  { value: 4, symbols: '☀️☀️', label: 'Bien !', color: '#8BC34A' },
  { value: 3, symbols: '☁️', label: 'Moyen', color: '#FFC107' },
  { value: 2, symbols: '☁️⛈️', label: 'Difficultés', color: '#FF9800' },
  { value: 1, symbols: '⛈️', label: 'Très difficile', color: '#F44336' },
];

export default function TeacherEvaluation() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<number>(0);
  const [selectedStudent, setSelectedStudent] = useState<number>(0);
  const [evaluation, setEvaluation] = useState<any>({});
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login/teacher');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!profile || profile.role !== 'enseignant') {
        router.push('/');
        return;
      }

      setUser(profile);

      // Charger les classes
      const { data: classesData } = await supabase
        .from('classes')
        .select('*')
        .order('nom_classe');
      if (classesData) setClasses(classesData);

      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const handleClassChange = async (classId: number) => {
    setSelectedClass(classId);
    setSelectedStudent(0);
    setEvaluation({});
    setComment('');

    const { data: studentsData } = await supabase
      .from('eleves')
      .select('*')
      .eq('classe_id', classId)
      .order('nom');
    if (studentsData) setStudents(studentsData);
  };

  const handleStudentChange = async (studentId: number) => {
    setSelectedStudent(studentId);
    setMessage('');

    // Charger l'évaluation existante
    const { data: evaluationData } = await supabase
      .from('evaluations')
      .select('*')
      .eq('eleve_id', studentId)
      .order('date_evaluation', { ascending: false })
      .limit(1)
      .single();

    if (evaluationData) {
      const eval_obj: any = {};
      COMPETENCES.forEach(comp => {
        eval_obj[comp.key] = evaluationData[comp.key] || null;
      });
      setEvaluation(eval_obj);
      setComment(evaluationData.commentaire_enseignant || '');
    } else {
      setEvaluation({});
      setComment('');
    }
  };

  const handleNiveauChange = (competenceKey: string, niveau: number) => {
    setEvaluation({
      ...evaluation,
      [competenceKey]: niveau,
    });
  };

  const handleSave = async () => {
    if (!selectedStudent) {
      setMessage('❌ Sélectionne un élève');
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      const { data: teacher } = await supabase
        .from('enseignants')
        .select('id')
        .eq('profile_id', user.id)
        .single();

      const evaluationData: any = {
        eleve_id: selectedStudent,
        enseignant_id: teacher.id,
        classe_id: selectedClass,
        date_evaluation: new Date().toISOString().split('T')[0],
        commentaire_enseignant: comment,
      };

      COMPETENCES.forEach(comp => {
        evaluationData[comp.key] = evaluation[comp.key] || null;
      });

      const { error } = await supabase
        .from('evaluations')
        .insert([evaluationData]);

      if (error) {
        setMessage('❌ Erreur: ' + error.message);
      } else {
        setMessage('✅ Évaluation sauvegardée !');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      setMessage('❌ Erreur');
    }

    setSaving(false);
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  if (loading) return <div className={styles.container}>Chargement...</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/teacher/dashboard" className={styles.headerBack}>
          ← Tableau de bord
        </Link>
        <h1>📊 Évaluer les compétences</h1>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          Déconnexion
        </button>
      </header>

      <main className={styles.main}>
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

        {/* Sélection classe */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontWeight: 'bold', marginRight: '10px' }}>
            📚 Sélectionne une classe :
          </label>
          <select
            value={selectedClass}
            onChange={(e) => handleClassChange(parseInt(e.target.value))}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            <option value={0}>-- Choisir une classe --</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.nom_classe}</option>
            ))}
          </select>
        </div>

        {/* Sélection élève */}
        {selectedClass > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontWeight: 'bold', marginRight: '10px' }}>
              👧 Sélectionne un élève :
            </label>
            <select
              value={selectedStudent}
              onChange={(e) => handleStudentChange(parseInt(e.target.value))}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
            >
              <option value={0}>-- Choisir un élève --</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.prenom} {s.nom}</option>
              ))}
            </select>
          </div>
        )}

        {/* Tableau d'évaluation */}
        {selectedStudent > 0 && (
          <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
            <h2>📋 Évaluation de {students.find(s => s.id === selectedStudent)?.prenom} {students.find(s => s.id === selectedStudent)?.nom}</h2>

            {/* Tableau des compétences */}
            <div style={{ marginBottom: '20px', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#e3f2fd' }}>
                    <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Compétence</th>
                    {NIVEAUX.map(n => (
                      <th key={n.value} style={{ padding: '10px', textAlign: 'center', border: '1px solid #ddd', fontSize: '0.9rem' }}>
                        {n.symbols}<br/><small>{n.label}</small>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPETENCES.map(comp => (
                    <tr key={comp.key} style={{ backgroundColor: '#fff' }}>
                      <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold' }}>
                        {comp.label}
                      </td>
                      {NIVEAUX.map(niveau => (
                        <td
                          key={`${comp.key}-${niveau.value}`}
                          style={{
                            padding: '10px',
                            textAlign: 'center',
                            border: '1px solid #ddd',
                            backgroundColor: evaluation[comp.key] === niveau.value ? niveau.color + '33' : 'transparent',
                            cursor: 'pointer',
                          }}
                          onClick={() => handleNiveauChange(comp.key, niveau.value)}
                        >
                          <input
                            type="radio"
                            name={comp.key}
                            value={niveau.value}
                            checked={evaluation[comp.key] === niveau.value}
                            onChange={() => handleNiveauChange(comp.key, niveau.value)}
                            style={{ cursor: 'pointer' }}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Commentaires */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>
                📝 Commentaires de l'enseignant :
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Ajoute des commentaires pour les parents..."
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: '10px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Bouton sauver */}
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'white',
                padding: '12px 30px',
                border: 'none',
                borderRadius: '6px',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                fontWeight: 'bold',
              }}
            >
              {saving ? '⏳ Sauvegarde en cours...' : '💾 Sauvegarder l\'évaluation'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}