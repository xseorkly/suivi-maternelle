import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { signIn } from '@/lib/auth';
import { getSettings } from '@/lib/supabase';
import styles from '@/styles/login.module.css';

export default function ParentLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      const data = await getSettings();
      if (data) {
        document.documentElement.style.setProperty('--color-primary', data.primary_color);
        document.documentElement.style.setProperty('--color-secondary', data.secondary_color);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn(email, password);

    if (result.success) {
      // Rediriger vers le dashboard parent
      router.push('/parent/dashboard');
    } else {
      setError(result.error || 'Identifiant ou mot de passe incorrect');
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h1>Connexion Parent</h1>
          <p>Consultez les informations concernant votre enfant</p>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre.email@exemple.fr"
              disabled={loading}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Votre mot de passe"
              disabled={loading}
              required
            />
          </div>

          <button type="submit" disabled={loading} className={styles.button}>
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>

        <div className={styles.footer}>
          <Link href="/" className={styles.backLink}>
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
