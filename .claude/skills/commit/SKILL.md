---
name: commit
description: Verifica visualmente y commitea solo los archivos tocados. Por defecto NO hace push (usa "/commit push" para incluir el push).
---

Argumento recibido: $ARGUMENTS

1. Ejecuta `git status` y `git diff` para ver exactamente qué cambió.
2. Si cambió HTML/CSS/JS, abre la página afectada en el navegador con hard reload
   y toma screenshot para confirmar que renderiza bien.
3. Agrega SOLO los archivos de este cambio con `git add <rutas>` — nunca `git add -A`,
   nunca toques lockfiles.
4. Commitea con mensaje conciso en español.
5. Si $ARGUMENTS contiene la palabra "push": ejecuta `git push origin HEAD` y reporta el hash del commit y confirmación de push.
   Si NO contiene "push" (caso por defecto, ej. al escribir solo "/commit"): NO hagas push. Reporta el hash del commit y recuérdame explícitamente "Commit guardado localmente, sin push — usa /commit push cuando quieras subir los cambios acumulados."
