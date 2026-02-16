# Script pour créer un fichier ZIP de déploiement
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$zipName = "the-polyglot-deployment-$timestamp.zip"

# Liste des fichiers et dossiers à inclure
$itemsToInclude = @(
    "src",
    "public", 
    "server",
    "database",
    "index.html",
    "package.json",
    "package-lock.json",
    "vite.config.js",
    "eslint.config.js",
    "firestore.rules",
    "README.md",
    "CATEGORIES_SYSTEM.md",
    "DYNAMIC_SETTINGS_GUIDE.md",
    ".gitignore"
)

# Créer le fichier ZIP
Write-Host "Création du fichier ZIP de déploiement: $zipName"
Write-Host "Compression des fichiers..."

try {
    Compress-Archive -Path $itemsToInclude -DestinationPath $zipName -Force -CompressionLevel Optimal
    
    $zipFile = Get-Item $zipName
    $sizeInMB = [math]::Round($zipFile.Length / 1MB, 2)
    
    Write-Host "✓ Fichier ZIP créé avec succès!" -ForegroundColor Green
    Write-Host "  Nom: $zipName" -ForegroundColor Cyan
    Write-Host "  Taille: $sizeInMB MB" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Contenu inclus:" -ForegroundColor Yellow
    foreach ($item in $itemsToInclude) {
        Write-Host "  - $item"
    }
    Write-Host ""
    Write-Host "Fichiers exclus: node_modules, .git, dist, fichiers de test" -ForegroundColor Gray
}
catch {
    Write-Host "✗ Erreur lors de la création du ZIP: $_" -ForegroundColor Red
    exit 1
}
