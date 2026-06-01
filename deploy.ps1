# deploy.ps1 - PianoKeyboard GitHub Pages Deployment Script

# Force UTF-8 encoding for PowerShell output
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "🚀 Starting PianoKeyboard deployment to GitHub Pages..." -ForegroundColor Cyan

# Check if git is installed
if (!(Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Error "Git is not installed or not in PATH. Please install Git first."
    Exit 1
}

# Ensure we are in the root directory D:\Study\WebPage\PianoKeyboard
Set-Location "D:\Study\WebPage\PianoKeyboard"

# Initialize Git if not already done
if (!(Test-Path ".git")) {
    Write-Host "📦 Initializing Git repository..." -ForegroundColor Yellow
    git init
}

# Set remote origin if not exists
$remote = git remote get-url origin 2>$null
if ([string]::IsNullOrEmpty($remote)) {
    Write-Host "🔗 Adding remote origin..." -ForegroundColor Yellow
    git remote add origin git@github.com:tramper2/PianoKeyboard.git
} else {
    Write-Host "🔗 Remote origin already set to: $remote" -ForegroundColor Gray
}

# Ensure main branch exists and rename default branch to main
git checkout -B main 2>$null

# Stage and commit all changes
Write-Host "📝 Staging and committing files..." -ForegroundColor Yellow
git add .
git commit -m "Deploy: PianoKeyboard release v1.0" 2>$null

# Push main branch to remote
Write-Host "⬆️ Pushing source files to main branch..." -ForegroundColor Yellow
git push -u origin main --force

# Deploy only the 'Source' directory to the root of 'gh-pages' branch
Write-Host "🌐 Deploying 'Source' folder contents to gh-pages branch..." -ForegroundColor Yellow
# We delete local gh-pages branch if it exists, then use subtree push
git branch -D gh-pages 2>$null
git subtree push --prefix Source origin gh-pages

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n🎉 Deployment completed successfully!" -ForegroundColor Green
    Write-Host "URL: https://tramper2.github.io/PianoKeyboard/" -ForegroundColor Green
} else {
    Write-Host "`n❌ Deployment failed. Please check your SSH keys or repository permissions." -ForegroundColor Red
}
