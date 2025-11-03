# Setup de la Vidéo Background

La vidéo `background-video.mp4` (620 MB) est trop volumineuse pour GitHub (limite 100 MB).

## Option 1 : Upload via Render Dashboard (Recommandé)

1. Allez sur https://dashboard.render.com
2. Sélectionnez votre service "Translatooor"
3. Allez dans l'onglet "Shell" ou utilisez SSH :
   ```bash
   ssh srv-d44e0obuibrs73a1ro5g@ssh.oregon.render.com
   ```
4. Créez le dossier si nécessaire :
   ```bash
   mkdir -p /opt/render/project/src/public/Video
   ```
5. Upload la vidéo via SCP depuis votre machine locale :
   ```bash
   scp "d:\CursorProj\Translating\public\Video\background-video.mp4" srv-d44e0obuibrs73a1ro5g@ssh.oregon.render.com:/opt/render/project/src/public/Video/
   ```

## Option 2 : Héberger la vidéo ailleurs

1. Upload la vidéo sur un service comme :
   - Cloudinary (gratuit jusqu'à 25GB)
   - AWS S3
   - Google Cloud Storage
   - Vercel Blob Storage

2. Mettez à jour `app/page.tsx` ligne ~90 pour utiliser l'URL externe :
   ```tsx
   <source src="https://votre-url.cloudinary.com/video/background-video.mp4" type="video/mp4" />
   ```

## Option 3 : Compresser la vidéo

Si vous voulez la garder dans le repo, compressez-la pour qu'elle fasse moins de 100MB :

```bash
# Avec ffmpeg
ffmpeg -i background-video.mp4 -vcodec libx264 -crf 28 -preset fast -vf scale=720:-1 compressed-video.mp4
```

Puis ajoutez-la au repo normalement.

## Option 4 : Utiliser Git LFS (GitHub)

1. Installez Git LFS : `git lfs install`
2. Ajoutez le tracking : `git lfs track "*.mp4"`
3. Ajoutez la vidéo : `git add public/Video/background-video.mp4`
4. Commit et push

**Note** : Git LFS a des limites sur le plan gratuit GitHub (1GB storage, 1GB bandwidth/mois).

## Solution actuelle

Le code cherche la vidéo à `/Video/background-video.mp4`. Si la vidéo n'est pas trouvée, le background restera noir (ce qui fonctionne aussi visuellement).

