import Noise from '@/components/Noise'; // Asegúrate que la ruta sea correcta
import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      position: 'relative', // Contenedor principal
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white', // Color del texto
      fontFamily: 'sans-serif',
      textAlign: 'center'
    }}>
      {/* El componente Noise llenará todo el div */}
      <Noise />

      {/* Contenido centrado que va por encima del ruido */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        <h1 style={{ fontSize: '6rem', fontWeight: 'bold', margin: 0 }}>404</h1>
        <p style={{ fontSize: '1.5rem', marginTop: '0.5rem' }}>Página no encontrada</p>
        <Link href="/" style={{
            display: 'inline-block',
            marginTop: '2rem',
            padding: '10px 20px',
            color: 'white',
            backgroundColor: 'rgba(0, 112, 243, 0.8)',
            borderRadius: '5px',
            textDecoration: 'none',
            backdropFilter: 'blur(5px)' // Efecto de desenfoque opcional
          }}>
            Regresar al Inicio
        </Link>
      </div>
    </div>
  );
}