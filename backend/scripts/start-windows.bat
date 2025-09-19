@echo off
echo Iniciando aplicacao Quiz JavaScript...
echo.

REM Define variavel de ambiente
set NODE_ENV=development

REM Executa o servidor
npx tsx server/index.ts