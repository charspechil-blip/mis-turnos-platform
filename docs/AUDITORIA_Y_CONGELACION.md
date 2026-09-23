# AUDITORÍA INTEGRAL Y CONGELACIÓN DEL ESTADO ACTUAL
## PROYECTO: MIS TURNOS PLATFORM

---

## 1. RESUMEN EJECUTIVO

1. **Estado técnico del repositorio**: El proyecto cuenta con una implementación completa y funcional en TypeScript y React 19 sobre Vite, estructurada según una arquitectura limpia por capas (`domain` → `usecases` → `data` → `components`).
2. **Discrepancia temporal crítica**: Mientras el documento rector (`README.md`) declara explícitamente que el proyecto se encuentra en la **Etapa 1 (Fundación Inicial)**, el código implementó de manera anticipada funcionalidades correspondientes a las **Etapas 2 (Modelo de Dominio), 3 (Motor de Planificación), 4 (Gestión), 5 (Solicitudes y Autorizaciones) y 6 (Importación/Exportación Excel)**.
3. **Decisiones de negocio ya materializadas**: El código contiene algoritmos con supuestos implícitos como días de descanso predeterminados para empleados fijos (sábados y domingos), precedencia de modificaciones autorizadas sobre excepciones médicas o vacaciones, fórmulas modulares de ciclo rotativo vinculadas obligatoriamente a grupos, y flujos atómicos de permuta.
4. **Acción rectora**: El estado conceptual y técnico queda **FORMALMENTE CONGELADO**. No se ha alterado ni un solo archivo, línea de código ni configuración. Todo el análisis siguiente detalla con exactitud forense lo que existe en el repositorio para someterlo a validación humana.

---

## 2. ESTADO REAL DEL PROYECTO

El proyecto no es un esqueleto vacío de fundación, sino un **prototipo funcional vertical de ciclo completo (End-to-End)**:

- **Infraestructura Base**: React 19, TypeScript 5.8 / 7.0, Vite 8, Tailwind CSS v4, Lucide React y biblioteca `xlsx`.
- **Capa de Dominio (`/src/domain`)**: Tipos de entidades completas y dos motores algorítmicos puros (`rotationCalculator.ts` y `officialScheduleResolver.ts`).
- **Capa de Casos de Uso (`/src/usecases`)**: Cinco módulos de aplicación que resuelven la cuadrícula general, orquestan solicitudes y autorizaciones, gestionan excepciones, procesan configuraciones y ejecutan importación/exportación con validación y prevención de sobreescritura.
- **Capa de Datos y Persistencia (`/src/data`)**: Un repositorio singleton apoyado en `localStorage` del navegador y un conjunto amplio de datos mock con dos empresas, ocho empleados, grupos, turnos y eventos históricos.
- **Capa de Presentación (`/src/components`)**: Once componentes con doble modo de interacción: *Experiencia de Gestión* (7 vistas: Cuadrante, Autorizaciones, Empleados/Grupos, Turnos/Rotaciones, Excepciones, Historial, Centro Excel) y *Experiencia del Empleado* (3 vistas: Mi Planificación, Mis Solicitudes, Compañeros de Equipo, más modal de nueva solicitud).

---

## 3. FUNCIONALIDADES POR ETAPA

| Archivo / Módulo | Funcionalidad Concreta | Etapa según README | Estado Actual | ¿Es Decisión de Negocio? | ¿Documentada en README? | Carácter Provisional | Riesgo Conceptual |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `src/main.tsx`, `App.tsx` | Montaje, contenedor principal y alternancia Gestión / Empleado | **Etapa 1 (Fundación)** | Implementado | No (infraestructura de UI) | Sí | No | Bajo |
| `src/domain/types.ts` | Definición de tipos: Empresa, Empleado, Turno, Grupo, Asignación, etc. | **Etapa 2 (Dominio)** | Implementado | **Sí** (tipado rígido de estados, roles y modelos) | Parcial | Sí | **Alto** (subtipos no acordados) |
| `src/domain/rules/rotationCalculator.ts` | Cálculo modular de días de ciclo rotativo continuo | **Etapa 3 (Motor)** | Implementado | **Sí** (fórmula matemática de desfase y anclaje) | Parcial | Sí | Medio |
| `src/domain/rules/officialScheduleResolver.ts` | Motor de cálculo dinámico del "Resultado Oficial" | **Etapa 3 (Motor)** | Implementado | **Sí** (jerarquía de 4 niveles de precedencia) | Parcial | Sí | **Muy Alto** (núcleo del sistema) |
| `src/usecases/planificacionUseCases.ts` | Generación de la grilla matricial y asignaciones directas | **Etapa 4 (Gestión)** | Implementado | **Sí** (fallback a 'LIB', sobreescritura manual) | Parcial | Sí | Medio |
| `src/components/gestion/CuadranteView.tsx` | Tabla interactiva de cuadrante mensual con navegación temporal | **Etapa 4 (Gestión)** | Implementado | No (representación visual) | Sí | Sí | Bajo |
| `src/components/gestion/EmpleadosGruposView.tsx` | CRUD de empleados y grupos | **Etapa 4 (Gestión)** | Implementado | **Sí** (vinculación empleado-grupo-rotación) | Parcial | Sí | Medio |
| `src/components/gestion/TurnosRotacionesView.tsx` | Catálogo de turnos y diseñador visual paso a paso de secuencias | **Etapa 4 (Gestión)** | Implementado | **Sí** (secuencia cíclica de pasos) | Parcial | Sí | Medio |
| `src/usecases/solicitudesUseCases.ts` | Creación, aprobación y rechazo de solicitudes; permutas atómicas | **Etapa 5 (Solicitudes/Autorizaciones)** | Implementado | **Sí** (materialización como `MODIFICACION_AUTORIZADA`) | Parcial | Sí | **Muy Alto** |
| `src/components/gestion/BandejaAutorizacionesView.tsx` | Bandeja de entrada para supervisores y formulario de resolución | **Etapa 5 (Solicitudes/Autorizaciones)** | Implementado | **Sí** (justificación y flujo de estados) | Parcial | Sí | Medio |
| `src/usecases/excepcionesUseCases.ts` | Registro y cancelación de vacaciones y licencias | **Etapa 5 (Solicitudes/Autorizaciones)** | Implementado | **Sí** (tipos de excepción y turno de sustitución) | No | Sí | Medio |
| `src/components/gestion/HistorialView.tsx` | Registro de trazabilidad de cambios | **Etapa 5 (Solicitudes/Autorizaciones)** | Implementado | **Sí** (tipos de evento y auditoría) | Sí | Sí | Bajo |
| `src/components/empleado/*` | Portal del empleado: consulta personal, solicitudes y equipo | **Etapa 5 (Solicitudes/Autorizaciones)** | Implementado | **Sí** (visibilidad de cuadrante de compañeros) | Parcial | Sí | Medio |
| `src/usecases/excelUseCases.ts` | Importador/exportador `.xlsx` con validador de conflictos | **Etapa 6 (Importación/Exportación)** | Implementado | **Sí** (regla de no sobreescritura de autorizaciones) | Parcial | Sí | **Alto** |
| `src/components/gestion/ExcelCenterView.tsx` | Panel de carga, previsualización de errores y exportación | **Etapa 6 (Importación/Exportación)** | Implementado | No (interfaz de pasarela) | Sí | Sí | Bajo |
| `src/data/storage.ts` | Repositorio local sobre `localStorage` del navegador | **Etapa 7 (Persistencia)** | Implementado | No (persistencia local provisional) | No | **Provisional** | Medio |

---

## 4. ENTIDADES Y MODELO DE DOMINIO ENCONTRADO

El archivo `/src/domain/types.ts` contiene catorce interfaces y tipos modelados:

1. **`Empresa`**: Entidad multinquilino (`id`, `nombre`, `identificadorFiscal?`, `sector?`, `fechaCreacion`).
2. **`Usuario`**: Cuenta de acceso (`id`, `empresaId`, `nombre`, `email`, `rol`: `'GESTOR' | 'EMPLEADO' | 'AUTORIZADOR'`, `empleadoId?`).
3. **`Empleado`**: Ficha del trabajador (`id`, `empresaId`, `nombre`, `apellidos`, `identificacionInterna`, `estado`: `'ACTIVO' | 'INACTIVO' | 'BAJA'`, `modalidadTrabajo`: `'FIJO' | 'ROTATIVO'`, `grupoId?`, `usuarioAsociadoId?`, `turnoFijoPredeterminadoId?`, `diasDescansoFijo?`: `number[]`, `fechaAlta`, `puesto?`).
4. **`Grupo`**: Agrupación operativa (`id`, `empresaId`, `nombre`, `descripcion?`, `colorIdentificador?`, `reglaRotacionId?`, `fechaInicioRotacion?`, `desfaseDias?`).
5. **`Turno`**: Franja o estado computable (`id`, `empresaId`, `codigo`, `nombre`, `esLibre`: `boolean`, `horaInicio?`, `horaFin?`, `horasComputables`: `number`, `colorHex`: `string`, `descripcion?`).
6. **`ReglaRotacion`**: Definición de patrón cíclico (`id`, `empresaId`, `nombre`, `descripcion?`, `longitudDias`: `number`, `pasos`: `PasoRotacion[]`).
7. **`PasoRotacion`** *(Estructura auxiliar de ciclo)*: Relación ordinal (`diaCiclo`: `number` de 1 a N, `turnoId`: `string`).
8. **`Asignacion`**: Registro temporal de turno asignado (`id`, `empresaId`, `empleadoId`, `fecha`: `YYYY-MM-DD`, `turnoId`, `origen`: `OrigenAsignacion`, `notas?`, `solicitudId?`, `fechaModificacion?`, `modificadoPorUsuarioId?`).
   - Discriminador `OrigenAsignacion`: `'ROTACION' | 'MANUAL' | 'IMPORTACION' | 'MODIFICACION_AUTORIZADA'`.
9. **`Excepcion`**: Alteración programada de la planificación (`id`, `empresaId`, `empleadoId`, `fechaInicio`, `fechaFin`, `tipo`: `TipoExcepcion`, `turnoReemplazoId?`, `motivo`, `estado`: `'ACTIVA' | 'FINALIZADA' | 'CANCELADA'`, `fechaRegistro`, `registradoPorUsuarioId?`).
   - Discriminador `TipoExcepcion`: `'VACACIONES' | 'LICENCIA' | 'BAJA_MEDICA' | 'AUSENCIA_JUSTIFICADA' | 'MODIFICACION_TEMPORAL' | 'OTRO'`.
10. **`Solicitud`**: Petición de un empleado (`id`, `empresaId`, `empleadoId`, `tipo`: `TipoSolicitud`, `fecha`, `fechaFin?`, `turnoPropuestoId?`, `empleadoDestinoId?`, `fechaDestino?`, `turnoOriginalSolicitanteId?`, `turnoOriginalDestinoId?`, `motivo`, `estado`: `'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'CANCELADA'`, `fechaCreacion`, `autorizacionId?`).
    - Discriminador `TipoSolicitud`: `'DIA_LIBRE' | 'CAMBIO_TURNO' | 'PERMUTA' | 'MODIFICACION_HORARIA'`.
11. **`Autorizacion`**: Resolución formal de una solicitud (`id`, `empresaId`, `solicitudId`, `autorizadorUsuarioId`, `autorizadorNombre`, `decision`: `'APROBADA' | 'RECHAZADA'`, `comentarioResolucion?`, `fechaDecision`, `cambiosAplicados?`: `CambioAplicado[]`).
12. **`CambioAplicado`** *(Estructura auxiliar)*: Registro del impacto (`empleadoId`, `fecha`, `turnoAnteriorId`, `turnoNuevoId`).
13. **`HistorialEvento`**: Asiento de auditoría inmutable (`id`, `empresaId`, `tipoEvento`: `TipoEventoHistorial`, `empleadoId?`, `empleadoNombre?`, `fechaAfectada?`, `turnoAnteriorCodigo?`, `turnoNuevoCodigo?`, `motivo`, `usuarioNombre`, `referenciaId?`, `timestamp`).
14. **`TurnoOficialDia`** *(Modelo compuesto devuelto por el resolver en tiempo de ejecución)*: Conecta `turnoPlanificado`, `origenPlanificado`, `solicitudPendiente`, `excepcionActiva`, `turnoOficial`, `origenOficial`, `autorizacion` y el flag booleano `esModificadoOficial`.

---

## 5. REGLAS DE NEGOCIO ACTUALES

1. **Determinación del turno de un empleado FIJO**:
   - Se consulta el día de la semana en formato UTC (0 = Domingo, ..., 6 = Sábado).
   - Se comprueba si coincide con `diasDescansoFijo` (por defecto fines de semana `[0, 6]`).
   - Si no es descanso, se asigna `turnoFijoPredeterminadoId` con origen `'MANUAL'`.
2. **Determinación del turno de un empleado ROTATIVO**:
   - Requiere estar asignado a un `Grupo` con una `ReglaRotacion`.
   - Se calcula la diferencia en días enteros con la fecha de anclaje (`fechaInicioRotacion`, default `'2026-01-01'`).
   - Se aplica la fórmula modular: `diaCiclo = (((rawDiff + desfase) % cycleLength) + cycleLength) % cycleLength + 1`.
   - Se busca el turno en los pasos de la regla con origen `'ROTACION'`.
3. **Asignaciones manuales**:
   - Una asignación manual guardada tiene origen `'MANUAL'` y sustituye a la planificación base, salvo excepciones o autorizaciones.
4. **Solicitudes pendientes**:
   - Una solicitud pendiente **no altera el Resultado Oficial**. Solo se incluye como metadato informativo.
5. **Solicitud aprobada**:
   - Pasa a estado `'APROBADA'`, se crea un registro de `Autorizacion`, se crea/sobrescribe una `Asignacion` con `origen: 'MODIFICACION_AUTORIZADA'`, y se genera un evento en el historial.
6. **Solicitud rechazada**:
   - Pasa a estado `'RECHAZADA'`. No altera asignaciones y registra la justificación en el historial.
7. **Permutas**:
   - Operación atómica bilateral: al aprobarse se generan dos registros de `Asignacion` cruzados con `origen: 'MODIFICACION_AUTORIZADA'`.
8. **Excepciones**:
   - Intervalo continuo que suspende el turno base por vacaciones, baja médica, etc.
9. **Importación Excel**:
   - Carga masiva con `origen: 'IMPORTACION'`. Protege contra sobreescritura de modificaciones autorizadas por defecto.

---

## 6. DECISIONES INVENTADAS O NO VALIDADAS

1. **Días de descanso predeterminados de empleados fijos**: Asumidos como sábado y domingo (`[0, 6]`).
2. **Fecha de anclaje predeterminada para grupos rotativos**: Fijada en `'2026-01-01'`.
3. **Catálogo cerrado de tipos de solicitud**: `'DIA_LIBRE'`, `'CAMBIO_TURNO'`, `'PERMUTA'`, `'MODIFICACION_HORARIA'`.
4. **Catálogo cerrado de tipos de excepción**: `'VACACIONES'`, `'LICENCIA'`, `'BAJA_MEDICA'`, `'AUSENCIA_JUSTIFICADA'`, `'MODIFICACION_TEMPORAL'`, `'OTRO'`.
5. **Pertenencia de la regla de rotación al Grupo**: Impide que un empleado rotativo tenga una regla individual sin grupo.
6. **Materialización de autorizaciones en la tabla genérica `Asignacion`**: Con etiqueta `origen = 'MODIFICACION_AUTORIZADA'`.
7. **Roles de usuario rígidos**: `'GESTOR' | 'EMPLEADO' | 'AUTORIZADOR'`.
8. **Precedencia de Modificación Autorizada sobre Excepciones**: Una autorización aplasta a una baja médica en el resolver actual.
9. **Síntesis de turno provisional 'LIB'**: Con 0 horas si no se encuentra turno en catálogo.
10. **Protección de importaciones basada en origen**: Detección exclusiva de `MODIFICACION_AUTORIZADA`.

---

## 7. CONTRADICCIONES CON README

1. **Fase declarativa**: El README declara estar en *Fundación Inicial*, pero el código implementa lógica de Etapas 2, 3, 4, 5 y 6. (**Avance prematuro**).
2. **Catálogo de entidades**: El README define estrictamente 12 conceptos iniciales; el código añadió estructuras auxiliares de primer nivel (`PasoRotacion`, `CambioAplicado`, `TurnoOficialDia`). (**Diferencia de modelado**).
3. **Dependencias**: Se incorporó la librería binaria externa `xlsx` no contemplada expresamente en la etapa inicial. (**Diferencia de alcance**).

---

## 8. MODELO DE RESULTADO OFICIAL

### Fuentes consultadas:
1. `asignaciones`
2. `excepciones`
3. `solicitudes` (solo metadato)
4. `reglasRotacion` (rotativos) / `turnoFijoPredeterminadoId` + `diasDescansoFijo` (fijos)
5. `turnos`
6. `autorizaciones`

### Jerarquía algorítmica actual:
```
[Nivel 1] Asignación con origen === 'MODIFICACION_AUTORIZADA' (Prioridad Máxima)
    ↓ (si no existe)
[Nivel 2] Excepción activa en la fecha (Vacaciones, Bajas, etc.)
    ↓ (si no existe)
[Nivel 3] Asignación guardada previa (origen === 'MANUAL' o 'IMPORTACION')
    ↓ (si no existe)
[Nivel 4] Planificación Base (Regla de rotación modular o turno fijo semanal)
```

---

## 9. DATOS MOCK

Ubicados en `/src/data/mockDatabase.ts`:
- 2 empresas ficticias (*Novasol* e *Iberia Metalúrgica*).
- 4 usuarios y 8 empleados ficticios.
- 8 turnos y 2 reglas de rotación con ciclos de 8 y 14 días.
- Asignaciones, excepciones, solicitudes y eventos de historial representativos.

---

## 10. PERSISTENCIA Y ARQUITECTURA

- **Base de datos real**: No existe.
- **Backend / API**: No existe.
- **Almacenamiento actual**: Repositorio en cliente serializado en **`localStorage`** (`mis_turnos_database_v1`).
- **Diagnóstico**: Abstracción de repositorio preparada; infraestructura de servidor inexistente.

---

## 11. RIESGOS

1. Divergencia de dominio por tipos no consensuados.
2. Fragilidad en `Asignacion` por sobrecarga de responsabilidades (fijo, manual, importado, autorizado).
3. Violación legal potencial al priorizar autorizaciones sobre bajas médicas.
4. Acoplamiento estricto a esquemas específicos de Excel.
5. Inconsistencia o pérdida de datos por monolito JSON en `localStorage`.

---

## 12. ELEMENTOS QUE PUEDEN CONSERVARSE

1. Separación física en capas (`domain`, `usecases`, `data`, `components`).
2. Algoritmo modular agnóstico en UTC (`rotationCalculator.ts`).
3. Principio de resolución en tiempo de ejecución (`officialScheduleResolver.ts`).
4. Aislamiento multiempresa mediante `empresaId`.
5. Documento Rector `README.md`.

---

## 13. ELEMENTOS QUE REQUIEREN VALIDACIÓN HUMANA

1. Precedencia entre Excepciones (bajas) y Autorizaciones (cambios).
2. Modelo separado para Modificaciones Autorizadas vs Asignaciones ordinarias.
3. Posibilidad de rotación individual por empleado sin pertenecer a grupo.
4. Catálogo configurable de tipos de solicitud y excepción.
5. Definición y configuración de descansos de empleados fijos.

---

## 14. PREGUNTAS DE DOMINIO PENDIENTES

1. ¿Un empleado puede tener un histórico de grupos a lo largo del tiempo?
2. ¿Las permutas son libres en toda la empresa o restringidas a grupo/categoría?
3. ¿Una solicitud de día libre descuenta saldo de vacaciones?
4. ¿Los cambios en reglas de rotación deben ser retroactivos o solo hacia el futuro?
5. ¿Se requerirán turnos partidos o tramos horarios detallados en el futuro?

---

## 15. CONCLUSIÓN

El repositorio ha sido auditado de forma exhaustiva. Todo el desarrollo queda **FORMALMENTE CONGELADO** a la espera de las decisiones humanas sobre los aspectos de dominio identificados.
