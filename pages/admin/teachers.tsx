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