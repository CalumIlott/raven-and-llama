@echo off
title Raven & Llama Learning Web Server
echo Starting Raven & Llama Learning...
powershell -ExecutionPolicy Bypass -File "%~dp0start-server.ps1"
pause
