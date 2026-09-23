# GUÍA DE SINCRONIZACIÓN MANUAL CON GITHUB

Esta guía detalla los pasos para sincronizar este repositorio local con tu repositorio remoto de GitHub.

---

## 1. ESTADO ACTUAL DEL REPOSITORIO LOCAL

- **Rama principal**: `main`
- **Archivos bajo control de versiones**: Todo el código fuente, configuración, Documento Rector (`README.md`), y los informes en la carpeta `docs/`.

---

## 2. OPCIÓN A: VINCULAR CON UN REPOSITORIO EXISTENTE EN GITHUB

Si ya tienes creado un repositorio vacío (o existente) en GitHub:

### Paso 1: Configurar el origen remoto
Reemplaza `<usuario>` y `<repositorio>` por los datos de tu cuenta:

```bash
git remote add origin https://github.com/<usuario>/<repositorio>.git
```

*(Si utilizas autenticación por clave SSH:)*
```bash
git remote add origin git@github.com:<usuario>/<repositorio>.git
```

### Paso 2: Verificar la vinculación
```bash
git remote -v
```

### Paso 3: Enviar los cambios (Push)
```bash
git push -u origin main
```

*(Si tu repositorio remoto en GitHub ya contenía commits previos como un README inicial o LICENSE, puedes forzar o integrar con:)*
```bash
git pull origin main --allow-unrelated-histories
git push -u origin main
```

---

## 3. OPCIÓN B: SINCRONIZACIÓN USANDO UN PERSONAL ACCESS TOKEN (PAT)

Si GitHub te solicita credenciales al hacer `git push`:

1. Genera un Personal Access Token (classic o fine-grained con permisos de `repo`) desde:  
   `GitHub → Settings → Developer Settings → Personal Access Tokens`.
2. Ejecuta el push especificando el token:
   ```bash
   git push https://<TU_TOKEN>@github.com/<usuario>/<repositorio>.git main
   ```
   O configura la URL con el token:
   ```bash
   git remote set-url origin https://<TU_TOKEN>@github.com/<usuario>/<repositorio>.git
   git push -u origin main
   ```

---

## 4. OPCIÓN C: DESCARGAR O MOVER MANUALMENTE

Si deseas descargar o copiar el proyecto directamente a tu máquina:
1. Todos los archivos están en el directorio raíz del proyecto.
2. La documentación rectora y de análisis se encuentra en:
   - `README.md`: Documento Rector del Proyecto.
   - `docs/AUDITORIA_Y_CONGELACION.md`: Informe completo de auditoría y análisis de riesgos.
   - `docs/VALIDACION_DOMINIO_FASE_1.md`: Análisis formal del Resultado Oficial, casos de conflicto y decisiones pendientes.
