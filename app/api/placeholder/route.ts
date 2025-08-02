import { NextRequest, NextResponse } from 'next/server';
import { createCanvas } from 'canvas';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // Obtener parámetros de la URL
  const width = parseInt(searchParams.get('width') || '96', 10);
  const height = parseInt(searchParams.get('height') || '96', 10);
  const bg = searchParams.get('bg') || 'CCCCCC';
  const text = searchParams.get('text') || 'Placeholder';
  const textColor = searchParams.get('textColor') || '4D4D4D';
  
  // Crear un canvas con las dimensiones especificadas
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Dibujar el fondo
  ctx.fillStyle = `#${bg}`;
  ctx.fillRect(0, 0, width, height);
  
  // Configurar el texto
  ctx.fillStyle = `#${textColor}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Ajustar el tamaño de la fuente según el ancho del canvas
  const fontSize = Math.max(10, Math.floor(width / 10));
  ctx.font = `${fontSize}px Arial, sans-serif`;
  
  // Dividir el texto en líneas si es necesario
  const words = text.split('+');
  const lines = [];
  let currentLine = words[0];
  
  for (let i = 1; i < words.length; i++) {
    const testLine = currentLine + ' ' + words[i];
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > width - 20) {
      lines.push(currentLine);
      currentLine = words[i];
    } else {
      currentLine = testLine;
    }
  }
  lines.push(currentLine);
  
  // Dibujar cada línea de texto
  const lineHeight = fontSize * 1.2;
  const totalHeight = lines.length * lineHeight;
  const startY = (height - totalHeight) / 2 + lineHeight / 2;
  
  lines.forEach((line, index) => {
    ctx.fillText(line, width / 2, startY + index * lineHeight);
  });
  
  // Convertir el canvas a un buffer PNG
  const buffer = canvas.toBuffer('image/png');
  
  // Devolver la imagen como respuesta
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}