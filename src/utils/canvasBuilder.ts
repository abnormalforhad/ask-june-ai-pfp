export async function generatePFP(imageUrl: string, tagline: string, styleId: string = 'style1'): Promise<string> {
  const SIZE = 1080;
  
  // Create an off-screen canvas
  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) throw new Error("Could not get canvas context");

  // Load the image securely managing CORS
  const img = new Image();
  img.crossOrigin = "anonymous";
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    // Proxy through a generic CORS proxy if it's an external URL to bypass standard canvas tainting limitations
    if (imageUrl.startsWith('http')) {
      img.src = `https://corsproxy.io/?${encodeURIComponent(imageUrl)}`;
    } else {
      img.src = imageUrl;
    }
  });

  // Draw image (cover-fit to square)
  const scale = Math.max(SIZE / img.width, SIZE / img.height);
  const w = img.width * scale;
  const h = img.height * scale;
  const x = (SIZE - w) / 2;
  const y = (SIZE - h) / 2;
  ctx.drawImage(img, x, y, w, h);

  // ── Gradient overlay (bottom) ──
  if (styleId !== 'style5') {
    const grad = ctx.createLinearGradient(0, SIZE * 0.55, 0, SIZE);
    grad.addColorStop(0, 'rgba(5, 13, 20, 0)');
    grad.addColorStop(0.5, 'rgba(5, 13, 20, 0.7)');
    grad.addColorStop(1, 'rgba(5, 13, 20, 0.95)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, SIZE, SIZE);
  }

  // ── Cyan accent gradient overlay (top-left) ──
  if (styleId === 'style1' || styleId === 'style4') {
    const accentGrad = ctx.createLinearGradient(0, 0, SIZE * 0.6, SIZE * 0.6);
    accentGrad.addColorStop(0, 'rgba(0, 229, 255, 0.15)');
    accentGrad.addColorStop(1, 'rgba(0, 229, 255, 0)');
    ctx.fillStyle = accentGrad;
    ctx.fillRect(0, 0, SIZE, SIZE);
  } else if (styleId === 'style3') {
    ctx.fillStyle = 'rgba(5, 13, 20, 0.4)';
    ctx.fillRect(0, 0, SIZE, SIZE);
  }

  // ── Top-right brand badge or Ribbon ──
  if (styleId === 'style2') {
    ctx.save();
    ctx.translate(SIZE - 150, 150);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(-200, -30, 400, 60);
    ctx.fillStyle = '#050D14';
    ctx.font = '800 24px "Inter", "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.letterSpacing = '3px';
    ctx.fillText('NEURAL AI', 0, 8);
    ctx.restore();
  } else if (styleId === 'style4') {
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.5)';
    ctx.lineWidth = 20;
    ctx.strokeRect(10, 10, SIZE - 20, SIZE - 20);
  } else {
    const badgeText = 'ASK JUNE AI';
    ctx.font = '600 22px "Inter", "Segoe UI", sans-serif';
    const badgeWidth = ctx.measureText(badgeText).width + 50;
    const badgeH = 42;
    const badgeX = SIZE - badgeWidth - 32;
    const badgeY = 32;

    ctx.fillStyle = 'rgba(5, 13, 20, 0.75)';
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeWidth, badgeH, 99);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#00E5FF';
    ctx.beginPath();
    ctx.arc(badgeX + 20, badgeY + badgeH / 2, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '600 18px "Inter", "Segoe UI", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(badgeText, badgeX + 34, badgeY + badgeH / 2 + 6);
  }

  // ── Top-Left Logo Logo ──
  if (styleId === 'style3' || styleId === 'style5') {
     ctx.fillStyle = 'rgba(0, 229, 255, 0.9)';
     ctx.beginPath();
     ctx.arc(60, 60, 20, 0, Math.PI*2);
     ctx.fill();
     ctx.fillStyle = '#050D14';
     ctx.font = '800 20px "Inter", sans-serif';
     ctx.fillText('J', 54, 67);
  }

  // ── Bottom tagline pill ──
  const pillText = tagline.toUpperCase();
  ctx.font = '500 24px "Inter", "Segoe UI", sans-serif';
  ctx.textAlign = 'left';
  const pillWidth = ctx.measureText(pillText).width + 60;
  const pillH = 52;
  
  if (styleId === 'style5') {
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 32px "Inter", "Segoe UI", sans-serif';
    ctx.fillText(pillText, 40, SIZE - 40);
  } else {
    const pillX = styleId === 'style3' ? (SIZE - pillWidth)/2 : 40;
    const pillY = SIZE - 60 - pillH;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillWidth, pillH, 14);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    ctx.stroke();

    const starX = pillX + 22;
    const starY = pillY + pillH / 2;
    ctx.fillStyle = '#00E5FF';
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      const outerR = 8;
      const innerR = 3;
      ctx.lineTo(starX + Math.cos(angle) * outerR, starY + Math.sin(angle) * outerR);
      const midAngle = angle + Math.PI / 4;
      ctx.lineTo(starX + Math.cos(midAngle) * innerR, starY + Math.sin(midAngle) * innerR);
    }
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '500 20px "Inter", "Segoe UI", sans-serif';
    ctx.fillText(pillText, pillX + 40, pillY + pillH / 2 + 7);
  }

  // ── Bottom-right "Powered by June AI" ──
  if (styleId !== 'style5') {
    ctx.font = '400 16px "Inter", "Segoe UI", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.textAlign = 'right';
    ctx.fillText('Powered by Ask June AI', SIZE - 40, SIZE - 30);
    ctx.textAlign = 'left';
  }

  return canvas.toDataURL('image/png');
}
