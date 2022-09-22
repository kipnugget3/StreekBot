#!/bin/sh

echo 'Pulling code from GitHub'
git pull origin main

echo '--------------------------------------------------'

echo 'Installing dependencies'
npm ci

echo '--------------------------------------------------'

echo 'Building'
npm run build

echo '--------------------------------------------------'

echo 'Pruning devDependencies'
npm prune --omit=dev

echo '--------------------------------------------------'

echo 'Deployed successfully!'
