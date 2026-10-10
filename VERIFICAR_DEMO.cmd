@echo off
chcp 65001 >nul
title Verificar microservicios - Cabeza de Algodon
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\verificar-demo.ps1"
echo.
pause

