@echo off
chcp 65001 >nul
title Detener microservicios - Cabeza de Algodon
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\detener-demo.ps1"
echo.
pause

