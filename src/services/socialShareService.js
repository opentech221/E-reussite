// =============================================
// SERVICE DE PARTAGE SOCIAL (Phase 2)
// Partage des résultats sur réseaux sociaux
// =============================================

class SocialShareService {
  constructor() {
    this.appUrl = import.meta.env.VITE_APP_URL || window.location.origin;
  }

  // ====================================
  // GÉNÉRATION DE MESSAGES
  // ====================================

  // Générer un message de partage
  generateShareText(result) {
    const { rank, score, competitionTitle, totalParticipants, badges } = result;
    
    const emoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '🏆';
    const ordinal = rank === 1 ? 'er' : 'e';
    
    let message = `${emoji} J'ai terminé ${rank}${ordinal}`;
    if (totalParticipants) {
      message += ` sur ${totalParticipants}`;
    }
    message += ` au "${competitionTitle}" avec un score de ${score} points ! 🎯\n\n`;
    
    // Ajouter les badges obtenus
    if (badges && badges.length > 0) {
      message += `🏆 Badges obtenus : ${badges.map(b => b.name).join(', ')}\n\n`;
    }
    
    message += `Rejoins-moi sur E-Réussite pour t'améliorer ! 📚`;
    
    return message;
  }

  // ====================================
  // PARTAGE SUR PLATEFORMES
  // ====================================

  // Partager sur WhatsApp
  shareOnWhatsApp(text, url) {
    const message = `${text}\n\n${url}`;
    const shareUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    
    window.open(shareUrl, '_blank');
    console.log('✅ [Social] Partage WhatsApp');
  }

  // Partager sur Twitter/X
  shareOnTwitter(text, url) {
    const hashtags = 'EReussite,Education,BFEM,BAC';
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=${hashtags}`;
    
    window.open(shareUrl, '_blank', 'width=550,height=420');
    console.log('✅ [Social] Partage Twitter');
  }

  // Partager sur Facebook
  shareOnFacebook(url, quote) {
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(quote)}`;
    
    window.open(shareUrl, '_blank', 'width=550,height=420');
    console.log('✅ [Social] Partage Facebook');
  }

  // Partager sur LinkedIn
  shareOnLinkedIn(url, summary) {
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    
    window.open(shareUrl, '_blank', 'width=550,height=420');
    console.log('✅ [Social] Partage LinkedIn');
  }

  // ====================================
  // GÉNÉRATION D'IMAGE
  // ====================================

  // Générer une image de résultat (pour partage)
  async generateShareImage(result) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Dimensions optimales pour réseaux sociaux
      canvas.width = 1200;
      canvas.height = 630;
      
      // Fond gradient
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#6366f1');
      gradient.addColorStop(0.5, '#8b5cf6');
      gradient.addColorStop(1, '#ec4899');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Ajouter des formes décoratives
      ctx.globalAlpha = 0.1;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(100, 100, 150, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(canvas.width - 100, canvas.height - 100, 200, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;
      
      // Logo/Titre
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 52px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('E-Réussite 🎓', canvas.width / 2, 100);
      
      // Rang emoji
      const rankEmoji = result.rank === 1 ? '🥇' : result.rank === 2 ? '🥈' : result.rank === 3 ? '🥉' : '🏆';
      ctx.font = '120px Arial, sans-serif';
      ctx.fillText(rankEmoji, canvas.width / 2, 250);
      
      // Rang texte
      ctx.font = 'bold 64px Arial, sans-serif';
      ctx.fillText(`Rang #${result.rank}`, canvas.width / 2, 340);
      
      // Score
      ctx.font = 'bold 56px Arial, sans-serif';
      ctx.fillText(`${result.score} points`, canvas.width / 2, 415);
      
      // Compétition
      ctx.font = '32px Arial, sans-serif';
      ctx.fillStyle = '#e0e7ff';
      const maxWidth = canvas.width - 100;
      const titleText = result.competitionTitle || 'Compétition';
      ctx.fillText(this.truncateText(ctx, titleText, maxWidth), canvas.width / 2, 475);
      
      // Badges
      if (result.badges && result.badges.length > 0) {
        ctx.font = 'bold 24px Arial, sans-serif';
        ctx.fillStyle = '#fef3c7';
        ctx.fillText(`🏆 ${result.badges.length} badge${result.badges.length > 1 ? 's' : ''} obtenu${result.badges.length > 1 ? 's' : ''}`, canvas.width / 2, 525);
      }
      
      // Footer
      ctx.font = 'bold 28px Arial, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('Rejoins-moi sur E-Réussite !', canvas.width / 2, 585);
      
      // Convertir en data URL
      resolve(canvas.toDataURL('image/png'));
    });
  }

  // Tronquer le texte si trop long
  truncateText(ctx, text, maxWidth) {
    if (ctx.measureText(text).width <= maxWidth) {
      return text;
    }
    
    let truncated = text;
    while (ctx.measureText(truncated + '...').width > maxWidth && truncated.length > 0) {
      truncated = truncated.slice(0, -1);
    }
    return truncated + '...';
  }

  // ====================================
  // LIENS D'INVITATION
  // ====================================

  // Générer un lien d'invitation
  generateInviteLink(userId, competitionId) {
    const baseUrl = `${this.appUrl}/competitions/${competitionId}`;
    const inviteCode = btoa(`${userId}-${Date.now()}`);
    return `${baseUrl}?ref=${inviteCode}`;
  }

  // Partager une invitation
  async shareInvite(userId, competitionId, competitionTitle) {
    const inviteLink = this.generateInviteLink(userId, competitionId);
    const message = `🎯 Rejoins-moi pour le "${competitionTitle}" sur E-Réussite !\n\nMets tes connaissances à l'épreuve et grimpe au classement ! 🏆\n\n${inviteLink}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Invitation: ${competitionTitle}`,
          text: message,
          url: inviteLink
        });
        console.log('✅ [Social] Invitation partagée (natif)');
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('❌ [Social] Erreur partage invitation:', error);
        }
      }
    } else {
      await navigator.clipboard.writeText(message);
      console.log('✅ [Social] Lien d\'invitation copié');
    }
  }
}

// Export singleton
export const shareResults = new SocialShareService();

// Export par défaut pour compatibilité
export const socialShareService = shareResults;
export default shareResults;
