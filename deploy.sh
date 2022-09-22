#!/bin/sh

clear
echo 'Pulling code from GitHub'
echo
git pull origin main

clear
echo 'Installing dependencies'
echo
npm ci

clear
echo 'Building'
echo
npm run build

clear
echo 'Pruning devDependencies'
echo
npm prune --omit=dev

clear
echo 'Deployed successfully!'
