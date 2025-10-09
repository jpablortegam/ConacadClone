import { useState, useEffect, useRef } from 'react';

interface AvatarImage {
  id: string;
  name: string | null;
  image: string;
}

interface ApiResponse {
  avatars: AvatarImage[];
  total: number;
  timestamp: number;
}

// Cache simple para evitar solicitudes repetidas
const cache = new Map<string, { data: string[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export function useAvatarImages(limit: number = 50, size: 'small' | 'medium' | 'large' = 'medium') {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const cacheKey = `${limit}-${size}`;
    
    // Verificar cache
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setImages(cached.data);
      setLoading(false);
      return;
    }

    const fetchAvatars = async () => {
      try {
        // Cancelar solicitud anterior si existe
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        
        abortControllerRef.current = new AbortController();
        
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/avatars?limit=${limit}&size=${size}`, {
          signal: abortControllerRef.current.signal,
          // Agregar headers para optimizar cache del navegador
          headers: {
            'Cache-Control': 'public, max-age=300', // 5 minutos
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: ApiResponse = await response.json();
        
        // Extraer solo las URLs de las imágenes
        const imageUrls = data.avatars.map(avatar => avatar.image);
        
        // Guardar en cache
        cache.set(cacheKey, {
          data: imageUrls,
          timestamp: Date.now()
        });
        
        setImages(imageUrls);
        
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return; // Solicitud cancelada, no hacer nada
        }
        
        console.error('Error fetching avatar images:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch images');
        setImages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAvatars();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [limit, size]);

  return { images, loading, error };
}