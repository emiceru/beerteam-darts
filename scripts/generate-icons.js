const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Tamaños de iconos requeridos según manifest.json
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Directorios
const inputSvg = path.join(__dirname, '../public/favicon.svg');
const outputDir = path.join(__dirname, '../public');

async function generateIcons() {
  console.log('🎯 Generando iconos PWA para Beer Team Darts...\n');

  try {
    // Verificar que el archivo SVG existe
    if (!fs.existsSync(inputSvg)) {
      throw new Error('Archivo favicon.svg no encontrado');
    }

    // Crear iconos para cada tamaño
    for (const size of iconSizes) {
      const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
      
      await sharp(inputSvg)
        .resize(size, size, {
          kernel: sharp.kernel.lanczos3,
          fit: 'contain',
          background: { r: 220, g: 20, b: 60, alpha: 1 } // #DC143C
        })
        .png({ quality: 90, compressionLevel: 9 })
        .toFile(outputPath);
      
      console.log(`✅ Generado: icon-${size}x${size}.png`);
    }

    // Generar favicon.ico tradicional
    await sharp(inputSvg)
      .resize(32, 32)
      .png()
      .toFile(path.join(outputDir, 'favicon-32x32.png'));
    
    await sharp(inputSvg)
      .resize(16, 16)
      .png()
      .toFile(path.join(outputDir, 'favicon-16x16.png'));

    console.log('✅ Generado: favicon-32x32.png');
    console.log('✅ Generado: favicon-16x16.png');

    // Generar icono Apple Touch
    await sharp(inputSvg)
      .resize(180, 180, {
        kernel: sharp.kernel.lanczos3,
        fit: 'contain',
        background: { r: 220, g: 20, b: 60, alpha: 1 }
      })
      .png({ quality: 90 })
      .toFile(path.join(outputDir, 'apple-touch-icon.png'));

    console.log('✅ Generado: apple-touch-icon.png');

    console.log('\n🎉 ¡Todos los iconos PWA generados exitosamente!');
    console.log('📝 Archivos creados en /public/');

  } catch (error) {
    console.error('❌ Error generando iconos:', error.message);
    process.exit(1);
  }
}

// Crear screenshots placeholder
async function generateScreenshots() {
  console.log('\n📱 Generando screenshots placeholder...');
  
  try {
    // Screenshot móvil (640x1136)
    await sharp({
      create: {
        width: 640,
        height: 1136,
        channels: 4,
        background: { r: 255, g: 248, b: 220, alpha: 1 } // #FFF8DC
      }
    })
    .composite([
      {
        input: Buffer.from(`
          <svg width="640" height="1136" xmlns="http://www.w3.org/2000/svg">
            <rect width="640" height="1136" fill="#FFF8DC"/>
            <text x="320" y="568" text-anchor="middle" fill="#DC143C" font-size="48" font-weight="bold" font-family="Arial">Beer Team Darts</text>
            <text x="320" y="620" text-anchor="middle" fill="#FFD700" font-size="24" font-family="Arial">Liga de Dardos</text>
            <circle cx="320" cy="400" r="80" fill="#DC143C" opacity="0.8"/>
            <circle cx="320" cy="400" r="60" fill="#FFF8DC"/>
            <circle cx="320" cy="400" r="40" fill="#DC143C"/>
            <circle cx="320" cy="400" r="20" fill="#FFD700"/>
          </svg>
        `),
        top: 0,
        left: 0
      }
    ])
    .png()
    .toFile(path.join(outputDir, 'screenshot-mobile.png'));

    // Screenshot desktop (1280x720)
    await sharp({
      create: {
        width: 1280,
        height: 720,
        channels: 4,
        background: { r: 255, g: 248, b: 220, alpha: 1 }
      }
    })
    .composite([
      {
        input: Buffer.from(`
          <svg width="1280" height="720" xmlns="http://www.w3.org/2000/svg">
            <rect width="1280" height="720" fill="#FFF8DC"/>
            <text x="640" y="360" text-anchor="middle" fill="#DC143C" font-size="64" font-weight="bold" font-family="Arial">Beer Team Darts League Manager</text>
            <text x="640" y="420" text-anchor="middle" fill="#FFD700" font-size="32" font-family="Arial">Gestiona tus ligas de dardos profesionalmente</text>
            <circle cx="200" cy="360" r="100" fill="#DC143C" opacity="0.8"/>
            <circle cx="1080" cy="360" r="100" fill="#DC143C" opacity="0.8"/>
          </svg>
        `),
        top: 0,
        left: 0
      }
    ])
    .png()
    .toFile(path.join(outputDir, 'screenshot-desktop.png'));

    console.log('✅ Generado: screenshot-mobile.png (640x1136)');
    console.log('✅ Generado: screenshot-desktop.png (1280x720)');

  } catch (error) {
    console.error('❌ Error generando screenshots:', error.message);
  }
}

// Ejecutar funciones
async function main() {
  await generateIcons();
  await generateScreenshots();
  
  console.log('\n🚀 PWA Assets listos! Tu aplicación ya es instalable.');
  console.log('💡 Próximo paso: Implementar notificaciones push');
}

main(); 