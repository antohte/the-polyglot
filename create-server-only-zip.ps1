# Script pour créer un ZIP avec UNIQUEMENT le serveur (pour Hostinger)
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$zipName = "server-deployment-$timestamp.zip"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Creation du ZIP de Deploiement Serveur" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verifier que client_build existe
if (-not (Test-Path "server\client_build")) {
    Write-Host "ERREUR: server\client_build n'existe pas!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Vous devez d'abord compiler le frontend:" -ForegroundColor Yellow
    Write-Host "  1. npm install" -ForegroundColor White
    Write-Host "  2. npm run build:all" -ForegroundColor White
    Write-Host ""
    exit 1
}

# Verifier que le build contient des fichiers
$buildFiles = Get-ChildItem "server\client_build" -Recurse
if ($buildFiles.Count -eq 0) {
    Write-Host "ERREUR: server\client_build est vide!" -ForegroundColor Red
    Write-Host "Executez: npm run build:all" -ForegroundColor Yellow
    exit 1
}

# Creer un dossier temporaire
$tempDir = "temp_deployment"
if (Test-Path $tempDir) {
    Remove-Item -Recurse -Force $tempDir
}
New-Item -ItemType Directory -Path $tempDir | Out-Null

Write-Host "Copie des fichiers du serveur..." -ForegroundColor Yellow

# Copier le contenu de server/ (sauf node_modules et .env)
$excludeItems = @("node_modules", ".env", ".env.local")
Get-ChildItem "server" | Where-Object { $excludeItems -notcontains $_.Name } | ForEach-Object {
    Copy-Item -Path $_.FullName -Destination $tempDir -Recurse -Force
    Write-Host "  OK $($_.Name)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Compression du ZIP..." -ForegroundColor Yellow

# Creer le ZIP
Compress-Archive -Path "$tempDir\*" -DestinationPath $zipName -Force -CompressionLevel Optimal

# Nettoyer
Remove-Item -Recurse -Force $tempDir

# Afficher les informations
$zipFile = Get-Item $zipName
$sizeInMB = [math]::Round($zipFile.Length / 1MB, 2)

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ZIP cree avec succes!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Fichier: $zipName" -ForegroundColor Cyan
Write-Host "Taille: $sizeInMB MB" -ForegroundColor Cyan
Write-Host ""
Write-Host "Contenu du ZIP:" -ForegroundColor Yellow
Write-Host "  - client_build/    (Frontend React compile)" -ForegroundColor Gray
Write-Host "  - routes/          (Routes API)" -ForegroundColor Gray
Write-Host "  - middleware/      (Middlewares)" -ForegroundColor Gray
Write-Host "  - scripts/         (Scripts utilitaires)" -ForegroundColor Gray
Write-Host "  - uploads/         (Dossier uploads)" -ForegroundColor Gray
Write-Host "  - index.js         (Point d'entree serveur)" -ForegroundColor Gray
Write-Host "  - db.js            (Configuration BDD)" -ForegroundColor Gray
Write-Host "  - package.json     (Dependances serveur)" -ForegroundColor Gray
Write-Host ""
Write-Host "Prochaines etapes sur Hostinger:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Supprimer tout le contenu de public_html/" -ForegroundColor White
Write-Host "2. Extraire ce ZIP dans public_html/" -ForegroundColor White
Write-Host "3. Creer le fichier .env avec vos identifiants" -ForegroundColor White
Write-Host "4. Via SSH: cd public_html && npm install --production" -ForegroundColor White
Write-Host "5. Configurer Node.js dans le panneau:" -ForegroundColor White
Write-Host "   - Entry Point: index.js" -ForegroundColor Gray
Write-Host "   - Root: public_html" -ForegroundColor Gray
Write-Host "   - Port: 5000" -ForegroundColor Gray
Write-Host "6. Demarrer: npm start" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
