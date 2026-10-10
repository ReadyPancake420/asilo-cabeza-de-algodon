@echo off
chcp 65001 >nul
title Iniciar microservicios - Cabeza de Algodon
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\iniciar-demo.ps1"
echo.
pause

