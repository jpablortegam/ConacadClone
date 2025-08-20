// hooks/useUserProfiles.ts
import { useState, useEffect } from 'react';
import type { UserProfile, ApiAvatar, UseUserProfilesReturn } from '@/types/bubbles';

/**
 * Hook personalizado para cargar usuarios de forma no bloqueante
 * Maneja el estado de carga, errores y datos de perfiles de usuario
 */
export const useUserProfiles = (): UseUserProfilesReturn => {
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const fetchUsers = async () => {
      try {
        // ✅ Delay más largo para reducir impacto en el render inicial
        timeoutId = setTimeout(async () => {
          if (!mounted) return;

          try {
            // ✅ Reducir el límite de avatares para evitar rate limiting
            const response = await fetch('/api/avatars?limit=15&size=small'); // Reducido de 25 a 15

            if (!response.ok) {
              if (response.status === 429) {
                throw new Error('Demasiadas peticiones. Usando modo básico.');
              }
              throw new Error('Failed to fetch user profiles');
            }

            const data = await response.json();

            if (!mounted) return;

            // Transformar los datos al formato esperado
            const profiles: UserProfile[] =
              data.avatars?.map((avatar: ApiAvatar) => ({
                name: avatar.name || 'Usuario',
                image: avatar.image,
              })) || [];

            // ✅ Filtrar URLs únicas para evitar duplicados
            const uniqueProfiles = profiles.filter(
              (profile, index, self) => index === self.findIndex((p) => p.image === profile.image)
            );

            setUserProfiles(uniqueProfiles);
            // console.log(`✅ Cargados ${uniqueProfiles.length} perfiles únicos desde la API`);
          } catch (fetchError) {
            if (mounted) {
              // console.warn('⚠️ Error cargando perfiles:', fetchError);
              setError(fetchError instanceof Error ? fetchError.message : 'Error desconocido');
              setUserProfiles([]);
            }
          } finally {
            if (mounted) {
              setIsLoading(false);
            }
          }
        }, 500); // ✅ Aumentado de 300ms a 500ms
      } catch (err) {
        if (mounted) {
          // console.warn('⚠️ Error en setup:', err);
          setError(err instanceof Error ? err.message : 'Error desconocido');
          setIsLoading(false);
        }
      }
    };

    fetchUsers();

    // Cleanup function
    return () => {
      mounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []); // Empty dependency array - solo se ejecuta una vez

  return { userProfiles, isLoading, error };
};
