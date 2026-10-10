@echo off
chcp 65001 >nul
title Aplicacion Cabeza de Algodon
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\abrir-aplicacion.ps1"

