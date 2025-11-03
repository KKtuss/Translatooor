@echo off
echo Initializing Git repository...
git init

echo Adding remote origin...
git remote add origin https://github.com/KKtuss/Translatooor.git

echo Adding all files...
git add .

echo Creating initial commit...
git commit -m "Initial commit - Ready for Render deployment"

echo Setting main branch...
git branch -M main

echo Pushing to GitHub...
git push -u origin main

echo Done! Check your repository at https://github.com/KKtuss/Translatooor
pause

