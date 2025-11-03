# Instructions pour déployer sur GitHub et Render

## Étape 1 : Initialiser Git et pousser vers GitHub

Ouvrez un terminal dans le dossier du projet et exécutez :

```bash
# Initialiser le dépôt Git
git init

# Ajouter le remote GitHub
git remote add origin https://github.com/KKtuss/Translatooor.git

# Ajouter tous les fichiers
git add .

# Faire le premier commit
git commit -m "Initial commit - Ready for Render deployment"

# Changer la branche principale en "main" si nécessaire
git branch -M main

# Pousser vers GitHub
git push -u origin main
```

**Note**: Si vous êtes invité à vous authentifier, vous pouvez utiliser:
- Un Personal Access Token (recommandé)
- Ou les credentials GitHub

## Étape 2 : Déployer sur Render

1. Allez sur https://dashboard.render.com
2. Cliquez sur "New +" → "Web Service"
3. Connectez votre compte GitHub si ce n'est pas déjà fait
4. Sélectionnez le dépôt "KKtuss/Translatooor"
5. Render détectera automatiquement le fichier `render.yaml`
6. Dans l'onglet "Environment", ajoutez la variable d'environnement :
   - **Key**: `MISTRAL_API_KEY`
   - **Value**: Votre clé API Mistral
7. Cliquez sur "Create Web Service"
8. Render va automatiquement :
   - Installer les dépendances
   - Builder le projet avec `npm run build`
   - Démarrer le service avec `npm start`

## Fichiers importants déjà configurés

✅ `render.yaml` - Configuration Render
✅ `.gitignore` - Fichiers ignorés (node_modules, .env, etc.)
✅ `README.md` - Documentation avec instructions de déploiement
✅ `package.json` - Scripts build/start configurés

## Variables d'environnement requises

- `MISTRAL_API_KEY` : Votre clé API Mistral (obligatoire)
- `NODE_ENV` : Automatiquement défini à `production` par Render

## Votre app sera disponible à

`https://tiktok-translator.onrender.com` (ou le nom que vous choisissez)

## Troubleshooting

Si vous rencontrez des erreurs :
1. Vérifiez que `MISTRAL_API_KEY` est bien définie dans Render
2. Consultez les logs dans le dashboard Render
3. Assurez-vous que le build passe localement : `npm run build`

