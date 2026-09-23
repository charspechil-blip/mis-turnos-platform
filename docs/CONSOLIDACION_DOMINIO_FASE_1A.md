# DOCUMENTO DE CONSOLIDACIÓN DEL DOMINIO — FASE 1A
## MIS TURNOS PLATFORM

---

## 1. OBJETIVO

El objetivo de esta Fase 1A es **recuperar la coherencia conceptual** de la plataforma **MIS TURNOS** antes de reanudar cualquier actividad de programación. 

El proyecto cuenta con una implementación acelerada que avanzó a través de etapas posteriores mientras el documento rector (*README.md*) sitúa formalmente el sistema en la etapa de **Fundación Inicial**. Esta fase audita, categoriza y consolida la totalidad del modelo conceptual identificando:
1. Qué principios y reglas están explícitamente consensuados y validados.
2. Qué elementos corresponden a decisiones técnicas o artefactos provisionales de prototipo.
3. Qué supuestos sustantivos de negocio fueron adoptados por el código sin validación humana.
4. Qué decisiones bloquean de forma crítica el avance del modelo de dominio.

**Criterio de gobernanza aplicado:**
El código fuente no ejerce autoridad sobre el negocio; representa únicamente evidencia fáctica de una implementación previa. Todo hallazgo se clasifica rigurosamente bajo los estados estipulados sin inferir aprobaciones tácitas ni forzar resoluciones donde exista ambigüedad.

---

## 2. ESTADO REAL DEL PROYECTO

Frente a la declaración del *README.md* (Sección 7: *"ESTADO ACTUAL: FUNDACIÓN INICIAL — Conceptos mínimos, estructura inicial y decisiones todavía no implementadas"*), el estado real del repositorio revela un **prototipo funcional vertical completo (End-to-End)**:

- **Infraestructura de Aplicación**: Aplicación SPA en React 19, TypeScript y Vite, estilizada mediante Tailwind CSS v4, con iconos Lucide y biblioteca de procesamiento de hojas de cálculo `xlsx`.
- **Capa de Dominio (`/src/domain`)**: Catorce tipos e interfaces estructuradas (`types.ts`) y dos motores de cálculo algorítmico funcional puro (`rotationCalculator.ts` y `officialScheduleResolver.ts`).
- **Capa de Casos de Uso (`/src/usecases`)**: Cinco módulos de orquestación que implementan la resolución de cuadrantes matriciales (`planificacionUseCases.ts`), la gestión del ciclo de vida de solicitudes y permutas bilaterales (`solicitudesUseCases.ts`), la gestión de ausencias e incapacidades (`excepcionesUseCases.ts`), la importación/exportación de archivos Excel con detección de colisiones (`excelUseCases.ts`) y la configuración de entidades maestras (`configuracionUseCases.ts`).
- **Capa de Datos y Persistencia (`/src/data`)**: Un repositorio en memoria con persistencia en `localStorage` (`storage.ts`) precargado con un dataset demostrativo (`mockDatabase.ts`) que abarca dos empresas, múltiples grupos, turnos, empleados, solicitudes, excepciones y eventos de auditoría.
- **Capa de Presentación (`/src/components`)**: Once componentes visuales distribuidos entre una interfaz administrativa para supervisores (con vistas de Cuadrante, Bandeja de Autorizaciones, Catálogos, Historial y Centro Excel) y un portal de autoservicio para el empleado.

---

## 3. MAPA ACTUAL DEL DOMINIO

A continuación se auditan todos los conceptos y estructuras presentes en el código fuente. Se clasifican bajo las categorías:
- **A**: Entidad conceptual validada en el marco rector.
- **B**: Estructura técnica o intermedia de implementación.
- **C**: Concepto todavía no definido formalmente.
- **D**: Concepto que posiblemente deba reconsiderarse o refactorizarse.

| Concepto | Ubicación en Código | Función Actual en el Sistema | Estado | Clasif. | Observaciones |
| :--- | :--- | :--- | :--- | :---: | :--- |
| **Empresa** | `src/domain/types.ts` (L5-11) | Delimita el espacio multinquilino (`tenant`). Agrupa usuarios, empleados, turnos y grupos. | VALIDADO | **A** | Pilar de aislamiento acordado. |
| **Usuario** | `src/domain/types.ts` (L13-20) | Cuenta de acceso al sistema con roles fijos (`GESTOR`, `EMPLEADO`, `AUTORIZADOR`). | IMPLEMENTACIÓN TÉCNICA | **D** | Los roles fueron hardcodeados en el código. No constan en el README. |
| **Empleado** | `src/domain/types.ts` (L22-38) | Ficha laboral del trabajador. Soporta modalidad fija/rotativa, grupo y turnos fijos. | VALIDADO | **A** | Entidad de negocio nuclear. |
| **Grupo** | `src/domain/types.ts` (L40-49) | Colectivo organizativo que ancla una regla de rotación con desfase en días. | VALIDADO | **A** | Necesita clarificar si es obligatorio para todo empleado rotativo. |
| **Turno** | `src/domain/types.ts` (L51-62) | Unidad de jornada computable. Posee código, horas, color y bandera `esLibre`. | VALIDADO | **A** | Cumple con la definición de catálogo de jornada. |
| **Regla de Rotación** | `src/domain/types.ts` (L64-75) | Patrón de ciclo continuo definido por su longitud en días y un array de pasos. | VALIDADO | **A** | Lógica desacoplada en `rotationCalculator.ts`. |
| **PasoRotacion** | `src/domain/types.ts` (L72-75) | Tupla `(diaCiclo, turnoId)` dentro de la regla de rotación. | IMPLEMENTACIÓN TÉCNICA | **B** | Estructura interna auxiliar para secuenciar los días del ciclo (1..N). |
| **Asignación** | `src/domain/types.ts` (L77-90) | Registro de turno para un empleado y fecha. Alberga orígenes: manual, rotación, importación y modificación autorizada. | CONTRADICCIÓN | **D** | Sobrecargada. Se utiliza como repositorio de turnos manuales y a la vez de autorizaciones. |
| **Excepción** | `src/domain/types.ts` (L92-111) | Rango temporal continuo que suspende el servicio (vacaciones, bajas médicas, licencias). | IMPLEMENTACIÓN TÉCNICA | **D** | El catálogo de tipos de excepción fue inventado por el código. |
| **Solicitud** | `src/domain/types.ts` (L113-138) | Petición de un empleado para librar, cambiar turno o permutar. | VALIDADO | **A** | Entidad de negocio acordada. Los subtipos cerrados requieren validación. |
| **Autorización** | `src/domain/types.ts` (L140-155) | Acto administrativo que resuelve una solicitud con estado `APROBADA` o `RECHAZADA`. | VALIDADO | **A** | Entidad conceptual válida. Su aplicación operativa está acoplada a `Asignacion`. |
| **CambioAplicado** | `src/domain/types.ts` (L157-162) | Subestructura que documenta el turno anterior y nuevo tras autorizar. | IMPLEMENTACIÓN TÉCNICA | **B** | Metadato documental incrustado dentro de la Autorización. |
| **Historial** (`HistorialEvento`) | `src/domain/types.ts` (L164-180) | Asiento inmutable cronológico de auditoría que registra eventos relevantes. | VALIDADO | **A** | Registra autor, motivo, fecha y estados anterior/nuevo. |
| **Importación / Exportación** | `src/usecases/excelUseCases.ts` | Pasarela de intercambio de datos bidireccional con archivos Excel. | IMPLEMENTACIÓN TÉCNICA | **B** | Mecanismo de entrada/salida, no fuente de verdad primaria. |
| **TurnoOficialDia** | `src/domain/types.ts` (L182-198) | Vista computada en tiempo de ejecución devuelta por el resolver. | IMPLEMENTACIÓN TÉCNICA | **B** | DTO o modelo de proyección dinámica en memoria; no se persiste en base de datos. |

---

## 4. RESULTADO OFICIAL ACTUAL

### ¿Qué significa actualmente el Resultado Oficial?
En la arquitectura actual, el **Resultado Oficial no es una tabla física de base de datos**, sino una **proyección computada en tiempo de ejecución**. 
Es el objeto `TurnoOficialDia` que devuelve la función pura `resolveOfficialScheduleForDay(...)` cuando la interfaz de usuario o un caso de uso consulta qué turno le corresponde a un empleado en una fecha determinada.

### ¿Qué datos intervienen en el cálculo?
1. El empleado en cuestión (`Empleado`) y su modalidad (`FIJO` o `ROTATIVO`).
2. La fecha solicitada (`YYYY-MM-DD`).
3. El conjunto de asignaciones persistidas (`db.asignaciones`) que coincidan en empleado y fecha.
4. El conjunto de excepciones activas (`db.excepciones`) cuyo rango `[fechaInicio, fechaFin]` incluya la fecha.
5. El grupo del empleado (`Grupo`) y su fecha de anclaje y desfase.
6. La regla de rotación vinculada al grupo (`ReglaRotacion`) y sus pasos (`PasoRotacion`).
7. El turno fijo predeterminado (`turnoFijoPredeterminadoId`) y los días de descanso fijo (`diasDescansoFijo`).
8. El catálogo completo de turnos de la empresa (`Turno[]`).
9. Las autorizaciones resueltas (`db.autorizaciones`) para extraer comentarios y resoluciones.

### ¿Qué datos NO intervienen en la determinación del turno oficial?
- **Solicitudes Pendientes**: Se evalúan para consultar su existencia, pero **no modifican el turno oficial**. Solo se adjuntan como metadato informativo dentro del atributo `solicitudPendiente`.
- **Solicitudes Rechazadas o Canceladas**: No alteran el cálculo.
- **Historial de Eventos (`HistorialEvento`)**: Es un registro pasivo de auditoría; el resolver no consulta el historial para inferir el turno.
- **Datos salariales, categorías profesionales o puestos**: Totalmente ausentes en la resolución.

### ¿Cuándo modifica el Resultado Oficial cada evento?
- **Solicitud**: Una solicitud por sí misma **NUNCA** modifica el resultado oficial mientras permanezca en estado `PENDIENTE`.
- **Autorización**: Modifica el resultado oficial **en el instante de ser aprobada**. Técnicamente, la aprobación genera una fila en `db.asignaciones` con `origen = 'MODIFICACION_AUTORIZADA'`. Al consultar el resolver, esta fila se detecta con prioridad 1 y desplaza cualquier otro turno.
- **Excepción**: Modifica el resultado oficial cuando su estado es `ACTIVA` y la fecha cae dentro de su intervalo de vigencia, **siempre y cuando no exista una modificación autorizada para esa misma fecha**.
- **Asignación Manual**: Modifica el resultado oficial en el momento en que el gestor la introduce, sustituyendo a la planificación base, **siempre y cuando no exista una excepción activa ni una modificación autorizada**.
- **Importación Excel**: Modifica el resultado oficial al insertar registros en `db.asignaciones` con `origen = 'IMPORTACION'`. Si el usuario no activa la protección, sobreescribe asignaciones previas; si activa la protección, respeta las que tengan `origen = 'MODIFICACION_AUTORIZADA'`.

### ¿Qué ocurre cuando existen varias fuentes simultáneamente?
El código aplica un algoritmo en cascada estricto y secuencial:
1. Si existe `MODIFICACION_AUTORIZADA`, se toma ese turno y finaliza la evaluación.
2. Si no, pero existe `EXCEPCION` activa, se toma el turno de la excepción (o descanso si no tiene reemplazo) y finaliza la evaluación.
3. Si no, pero existe `ASIGNACION` (`MANUAL` o `IMPORTACION`), se toma dicho turno y finaliza la evaluación.
4. Si no, se calcula la `PLANIFICACIÓN BASE` (por ciclo rotativo modular o descanso/turno fijo habitual).

---

## 5. MATRIZ DE PRECEDENCIA ACTUAL

La siguiente tabla resume el **comportamiento implementado en el prototipo actual**. No representa una precedencia validada por el negocio:

| Fuente | ¿Existe en el Código? | ¿Afecta Actualmente el Resultado? | Prioridad en Código | ¿Decisión de Negocio Validada? | Observaciones |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Modificación Autorizada** | Sí | Sí | **Nivel 1 (Máxima)** | **NO VALIDADO** | Se impone sobre bajas médicas y vacaciones. Requiere revisión crítica. |
| **Permuta Autorizada** | Sí | Sí | **Nivel 1 (Máxima)** | **NO VALIDADO** | Opera técnicamente como dos modificaciones autorizadas concurrentes. |
| **Excepción Activa** | Sí | Sí | **Nivel 2** | **NO VALIDADO** | Desplaza la planificación y asignación manual, pero se subordina a autorizaciones. |
| **Asignación Manual** | Sí | Sí | **Nivel 3** | **NO VALIDADO** | Sobreescribe la rotación base sin exigir justificación ni flujo de aprobación. |
| **Importación Excel** | Sí | Sí | **Nivel 3** | **NO VALIDADO** | Compite al mismo nivel que la asignación manual. |
| **Planificación Rotativa** | Sí | Sí | **Nivel 4 (Base)** | VALIDADO | Aplica el cálculo modular cuando no hay excepciones ni intervenciones. |
| **Planificación Fija** | Sí | Sí | **Nivel 4 (Base)** | VALIDADO | Aplica turno fijo o descanso en fines de semana por defecto. |
| **Solicitud Pendiente** | Sí | **No** | N/A (Informativa) | VALIDADO | No altera el resultado oficial. Solo viaja como metadato informativo. |
| **Solicitud Rechazada** | Sí | **No** | N/A (Inerte) | VALIDADO | No tiene efecto sobre el cuadrante oficial. |

---

## 6. SEPARACIÓN CONCEPTUAL

Se analiza si el código respeta la independencia de los planos del dominio o si incurre en solapamientos estructurales:

| Plano Conceptual | ¿Aislado en Código? | Evidencia de Aislamiento o Mezcla | Diagnóstico |
| :--- | :---: | :--- | :--- |
| **PLANIFICADO** | **SÍ** | Se calcula bajo demanda en `calcularTurnoPlanificadoBase` sin persistir matrices estáticas. Se expone de forma pura en `TurnoOficialDia.turnoPlanificado`. | **Separado correctamente** |
| **CALCULADO** | **SÍ** | Lógica matemática modular pura en `rotationCalculator.ts`, totalmente desacoplada de React y de la capa de almacenamiento. | **Separado correctamente** |
| **ASIGNADO** | **PARCIAL** | No existe frontera nítida entre lo asignado por planificación manual y lo asignado por decisión sobrevenida. La tabla `Asignacion` almacena indistintamente cargas de Excel, clics de gestor y solicitudes aprobadas. | **Mezclado con Modificado y Autorizado** |
| **SOLICITADO** | **SÍ** | Entidad aislada `Solicitud` con ciclo de vida documental propio (`PENDIENTE`, `APROBADA`, `RECHAZADA`, `CANCELADA`). | **Separado correctamente** |
| **AUTORIZADO** | **PARCIAL** | Existe la entidad `Autorizacion` para el acto formal, pero su efecto práctico no se evalúa a partir de la autorización, sino que se replica duplicando un registro dentro de `Asignacion`. | **Mezclado operativamente** |
| **EXCEPCIÓN** | **SÍ** | Entidad independiente `Excepcion` con fechas de inicio y fin, motivo y tipo específico. | **Separado correctamente** |
| **OFICIAL** | **SÍ** | No es un registro estático en base de datos; es una entidad calculada en tiempo real (`TurnoOficialDia.turnoOficial`). | **Separado conceptualmente** |
| **HISTÓRICO** | **SÍ** | Entidad independiente e inmutable `HistorialEvento` que registra eventos de forma desacoplada de la base operativa. | **Separado correctamente** |

---

## 7. DECISIONES VALIDABLES

Las siguientes decisiones y principios cuentan con respaldo explícito en el documento rector (*README.md*):

1. **El Calendario es una Representación, no el Dominio**: La cuadrícula visual mensual es solo un visor de proyección de datos; la lógica reside en los casos de uso y motores algorítmicos.
2. **Separación conceptual obligatoria**: Distinción de partida entre lo Planificado, lo Solicitado, lo Autorizado y el Resultado Oficial.
3. **Excel no es la Fuente de Verdad**: Es exclusivamente una herramienta de intercambio e interoperabilidad (importación/exportación).
4. **Trazabilidad de cambios**: Toda modificación o resolución de supervisión debe dejar constancia inmutable en un historial auditable.
5. **Aislamiento Multi-empresa**: Todas las entidades y operaciones de dominio deben estar particionadas de forma estricta por `empresaId`.
6. **Flexibilidad en Modalidades de Trabajo**: Coexistencia de empleados sujetos a reglas de rotación continua con empleados de turno fijo ordinario.
7. **Desacoplamiento Tecnológico**: La lógica de negocio no debe contener dependencias de React, interfaces de usuario ni mecanismos de almacenamiento particulares.
8. **Inmutabilidad de la Solicitud Pendiente**: Una petición de un empleado no confiere derechos ni altera cuadrantes hasta que media autorización expresa.

---

## 8. DECISIONES ASUMIDAS POR EL CÓDIGO

A continuación se inventarían las decisiones de negocio que fueron introducidas por la implementación previa sin respaldo explícito en el *README.md*:

| Decisión Asumida | Dónde se Implementa | ¿Documentada en README? | ¿Validada? | Nivel de Riesgo | Estado |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **1. Descanso en sábado y domingo por defecto para fijos** | `officialScheduleResolver.ts` (L66) | No | No | Alto | **NO VALIDADO** |
| **2. Fecha '2026-01-01' como anclaje default de rotación** | `officialScheduleResolver.ts` (L52) | No | No | Medio | **IMPLEMENTACIÓN TÉCNICA** |
| **3. Pertenencia de la rotación exclusivamente al Grupo** | `types.ts` (L45), `officialScheduleResolver.ts` (L50) | Parcial | No | Alto | **DECISIÓN PENDIENTE** |
| **4. Catálogo cerrado de 4 tipos de solicitud** | `types.ts` (L127-131) | Parcial | No | Medio | **NO VALIDADO** |
| **5. Catálogo cerrado de 6 tipos de excepción** | `types.ts` (L103-109) | No | No | Medio | **NO VALIDADO** |
| **6. Modificación Autorizada aplasta a Excepción médica/vacaciones** | `officialScheduleResolver.ts` (L82-115) | No | No | **Crítico** | **REQUIERE DECISIÓN HUMANA** |
| **7. Excepción prevalece sobre Asignación Manual previa** | `officialScheduleResolver.ts` (L98-120) | No | No | Alto | **REQUIERE DECISIÓN HUMANA** |
| **8. Reutilización de `Asignacion` para registrar autorizaciones** | `solicitudesUseCases.ts` (L123-134) | No | No | Alto | **IMPLEMENTACIÓN TÉCNICA** |
| **9. Síntesis de turno comodín 'LIB' con 0 horas** | `officialScheduleResolver.ts` (L152-163) | No | No | Bajo | **IMPLEMENTACIÓN TÉCNICA** |
| **10. Roles de usuario rígidos: GESTOR, EMPLEADO, AUTORIZADOR** | `types.ts` (L14) | No | No | Medio | **NO VALIDADO** |
| **11. Detección de colisiones Excel basada en origen 'MODIFICACION_AUTORIZADA'** | `excelUseCases.ts` (L235) | Parcial | No | Alto | **DECISIÓN PENDIENTE** |
| **12. Permuta atómica que intercambia y fija turnos cruzados indefinidamente** | `solicitudesUseCases.ts` (L138-207) | Parcial | No | Alto | **NO VALIDADO** |
| **13. Solicitud pendiente viaja como metadato dentro del Resultado Oficial** | `officialScheduleResolver.ts` (L77) | No | No | Bajo | **IMPLEMENTACIÓN TÉCNICA** |

---

## 9. TEMPORALIDAD

El análisis de la dimensión temporal en el código actual arroja conclusiones determinantes sobre la reactividad y la consistencia histórica del sistema:

1. **Ausencia de Frontera Temporal (Pasado / Presente / Futuro)**:
   - El código **no distingue entre fechas pasadas, el día de hoy y fechas futuras**.
   - No existe el concepto de "Cuadrante Cerrado", "Mes Consolidado" o "Cierre de Nómina". Todos los días del calendario se calculan bajo las mismas reglas y con la misma mutabilidad.
2. **Impacto de la reconfiguración de Reglas de Rotación**:
   - Si un supervisor modifica la longitud del ciclo o cambia los turnos en los pasos de una `ReglaRotacion`, **todos los cuadrantes pasados de la historia del grupo se recalculan automáticamente**. Esto destruye retroactivamente la realidad de lo que los empleados trabajaron hace meses si no medió una asignación manual explícita.
3. **Cambios en el Grupo o Modalidad del Empleado**:
   - El modelo de `Empleado` solo almacena un `grupoId` y una `modalidadTrabajo` actual. No existe un historial de adscripciones a grupos. Si un empleado pasa del Grupo A al Grupo B, el resolver asume que siempre perteneció al Grupo B, alterando el histórico visible.
4. **Modificación de Asignaciones Pasadas**:
   - Un gestor puede hacer clic en una fecha de hace seis meses y cambiar un turno. El sistema lo guardará en `db.asignaciones` y el resultado oficial cambiará de inmediato sin solicitar autorización especial por modificación retroactiva.
5. **Creación de Excepciones sobre Fechas Planificadas**:
   - Si se registra una baja médica para un rango pasado o futuro, el resolver recalcula el resultado oficial de forma instantánea. Sin embargo, si en ese rango ya existía una autorización previa, la baja quedará ignorada debido al orden de evaluación del código actual.

---

## 10. PERMUTAS

El código implementa el caso de uso de permutas entre dos trabajadores (`solicitudesUseCases.ts`). A continuación se detallan sus reglas operativas reales:

1. **Quién puede solicitarla y quién participa**:
   - La solicita un empleado indicando el `empleadoDestinoId` (compañero) y su `motivo`.
   - La interfaz permite elegir a **cualquier empleado de la misma empresa**, sin verificar si pertenecen al mismo grupo, departamento, cualificación o convenio colectivo.
2. **Fechas involucradas**:
   - La estructura soporta que la permuta sea en la misma fecha o en fechas diferentes (`fecha` para el solicitante y `fechaDestino` para el compañero).
3. **Obtención de turnos originales**:
   - En el momento de crear la solicitud, el sistema consulta el resolver para capturar `turnoOriginalSolicitanteId` y `turnoOriginalDestinoId`. Estos valores quedan congelados en el documento de la solicitud.
4. **Aplicación tras la aprobación**:
   - El supervisor aprueba la permuta mediante `aprobarSolicitud`.
   - El sistema inserta o actualiza dos filas en `db.asignaciones`:
     - Empleado Solicitante en `fecha` → recibe `turnoOriginalDestinoId` con `origen = 'MODIFICACION_AUTORIZADA'`.
     - Empleado Destino en `fechaDestino` → recibe `turnoOriginalSolicitanteId` con `origen = 'MODIFICACION_AUTORIZADA'`.
5. **Registro de Autorización e Historial**:
   - Se genera una única entidad `Autorizacion` que contiene un array `cambiosAplicados` con las dos modificaciones.
   - Se emiten dos eventos independientes en el `HistorialEvento` (uno por cada trabajador).
6. **Diagnóstico de Atomicidad**:
   - **No existe atomicidad técnica real**: El almacenamiento se apoya en un array JavaScript en memoria que se serializa en `localStorage`. Si el hilo de ejecución se interrumpiera entre la actualización de la primera asignación y la segunda, o si existiera un fallo de concurrencia en un backend futuro, el estado quedaría corrupto (uno con turno cambiado y el otro no). Existe una **intención de atomicidad procedural**, pero carece de soporte transaccional ACID.
7. **Contingencias no resueltas**:
   - Si uno de los turnos originales cambia entre la solicitud y la aprobación, la permuta aplica ciegamente los turnos capturados al inicio.
   - Si con posterioridad a la permuta uno de los dos empleados entra en baja médica o es despedido, el otro empleado permanece obligado indefinidamente a realizar el turno permutado.

---

## 11. IMPORTACIÓN EXCEL

El módulo `excelUseCases.ts` implementa la pasarela de intercambio de datos bidireccional. Se analizan sus reglas distinguiendo las mecánicas de importación de las normas de dominio:

1. **Datos que puede introducir**:
   - El importador procesa matrices donde las filas son empleados (identificados por documento, legajo o nombre) y las columnas son fechas con códigos de turno (`M`, `T`, `N`, `LIB`, etc.).
   - Traduce cada celda válida en un registro para `db.asignaciones` con `origen: 'IMPORTACION'`.
2. **Validaciones que realiza**:
   - Existencia del empleado en la base de datos de la empresa.
   - Existencia del código de turno en el catálogo corporativo.
   - Validez del formato de fecha.
3. **Detección de conflictos**:
   - El sistema comprueba si ya existía una asignación en esa fecha con `origen === 'MODIFICACION_AUTORIZADA'`.
4. **Mecanismo de protección y precedencia asumida**:
   - Si el parámetro `protegerAutorizados` está activado (`true`), la fila de Excel omite la celda en conflicto y emite una advertencia de "Turno oficial protegido no sobrescrito".
   - Si el parámetro está desactivado (`false`), la importación sobreescribe la modificación autorizada previa.
5. **Impacto sobre Excepciones y Asignaciones Manuales**:
   - **Sobre Excepciones**: El importador no valida si el empleado está de vacaciones o de baja. Graba la asignación importada en la base de datos. Sin embargo, en el resolver actual, la `EXCEPCION` (Nivel 2) se impone visualmente a la `IMPORTACION` (Nivel 3), por lo que la importación queda oculta.
   - **Sobre Asignaciones Manuales**: El Excel sobreescribe cualquier asignación manual previa introducida por un gestor en esa fecha sin emitir advertencia.
6. **Distinción entre Regla de Importación y Regla de Dominio**:
   - *Regla de Importación (Técnica)*: Mapeo de columnas, conversión de formatos de texto a mayúsculas y lectura binaria `.xlsx`.
   - *Regla de Dominio (Asumida sin validar)*: Que un archivo Excel tenga potestad para sobreescribir asignaciones manuales locales o que una modificación autorizada pueda ser destrozada si el usuario desmarca la casilla de protección.

---

## 12. CONTRADICCIONES README ↔ CÓDIGO

Se identifican las divergencias objetivas entre el documento rector (*README.md*) y la base de código auditada:

```
CONTRADICCIÓN 1: Fase declarativa vs Implementación real
README: "ESTADO ACTUAL: FUNDACIÓN INICIAL — No incluye todavía una implementación completa del sistema."
CÓDIGO: Implementa lógica completa de las Etapas 2, 3, 4, 5 y 6 (CRUD completo, autorizaciones, permutas, cálculo rotativo, exportador/importador binario).
TIPO: AVANCE PREMATURO SIGNIFICATIVO.

CONTRADICCIÓN 2: Catálogo cerrado de entidades
README: Sección 6 define taxativamente 12 entidades ("NO agregues nuevas entidades simplemente por conveniencia técnica").
CÓDIGO: Define tipos estructurados como entidades de primer nivel en el dominio (PasoRotacion, CambioAplicado, TurnoOficialDia).
TIPO: DIFERENCIA DE MODELADO TÉCNICO.

CONTRADICCIÓN 3: Restricción de dependencias externas
README: Sección 10 ("LO QUE NO DEBE HACERSE SIN AUTORIZACIÓN: NO implementar por iniciativa propia integración con librerías/servicios externos no solicitados").
CÓDIGO: Añadió al package.json y utiliza activamente la biblioteca de terceros "xlsx" (SheetJS).
TIPO: DIFERENCIA DE ALCANCE.

CONTRADICCIÓN 4: Tratamiento del concepto "Modificación"
README: Establece que debe existir distinción nítida entre Planificación, Solicitud, Autorización y Resultado Oficial.
CÓDIGO: No crea la entidad Modificación ni resuelve el Resultado Oficial directamente de la Autorización; reutiliza la entidad Asignacion mutando su discriminador de origen.
TIPO: AMBIGÜEDAD DE DISEÑO.
```

---

## 13. DECISIONES PENDIENTES

Inventario consolidado de decisiones de negocio identificadas en el sistema que requieren definición conceptual:

| ID | Decisión | Estado | Fuente | Impacto |
| :---: | :--- | :---: | :--- | :--- |
| **DEC-01** | Prevalencia entre Excepción médica sobrevenida y Modificación Autorizada previa. | REQUIERE DECISIÓN HUMANA | Código (`officialScheduleResolver.ts`) | **Crítico**: Cumplimiento legal y laboral. |
| **DEC-02** | Tratamiento temporal: si el Resultado Oficial histórico se congela periódicamente o se recalcula siempre. | REQUIERE DECISIÓN HUMANA | Vacío conceptual | **Crítico**: Integridad histórica y auditoría. |
| **DEC-03** | Naturaleza ontológica de la Asignación Manual: si requiere justificación obligatoria o sustituye la rotación de por vida. | REQUIERE DECISIÓN HUMANA | Código (`planificacionUseCases.ts`) | Alto: Gobernanza de supervisión. |
| **DEC-04** | Papel del archivo Excel: si representa una carga de planificación base o una sobreescritura operativa de autoridad. | REQUIERE DECISIÓN HUMANA | Código (`excelUseCases.ts`) | Alto: Coherencia de datos externos. |
| **DEC-05** | Comportamiento de la Permuta ante incapacidad temporal sobrevenida de uno de los participantes. | REQUIERE DECISIÓN HUMANA | Código (`solicitudesUseCases.ts`) | Alto: Continuidad operativa del servicio. |
| **DEC-06** | Posibilidad de que un empleado rotativo tenga una regla individual sin estar asignado a un Grupo. | PENDIENTE | Código (`types.ts`) | Medio: Flexibilidad contractual. |
| **DEC-07** | Configuración dinámica de días de descanso en empleados fijos (frente al hardcodeo actual de fin de semana). | PENDIENTE | Código (`officialScheduleResolver.ts`) | Medio: Soporte para contratos a turnos fijos en fin de semana. |
| **DEC-08** | Catálogo de tipos de solicitudes y excepciones: si deben ser fijos en el sistema o maestros editables por empresa. | PENDIENTE | Código (`types.ts`) | Medio: Extensibilidad sectorial. |
| **DEC-09** | Gestión de roles y autorizaciones: granularidad de permisos para aprobar solicitudes. | PENDIENTE | Código (`types.ts`) | Medio: Seguridad y perfiles de acceso. |
| **DEC-10** | Distinción formal entre fecha de aprobación de una solicitud y fecha de efectividad/publicación del cuadrante. | PENDIENTE | Vacío conceptual | Medio: Flujos de aprobación en dos fases. |

---

## 14. DECISIONES BLOQUEANTES

Para poder reanudar el trabajo técnico sin riesgo de retrabajo o corrupción del modelo, es imprescindible que los responsables humanos dictaminen sobre estas **cuatro decisiones bloqueantes**:

### BLOQUEO 1: Jerarquía de Conflicto entre Excepción y Autorización
> **Problema**: Si Carlos tiene una Modificación Autorizada concedida para trabajar en Turno 1 el 15 de octubre y posteriormente se le prescribe una Baja por Accidente Laboral (Excepción Activa) que cubre ese día:  
> - **Opción A (Fuerza Mayor)**: La Excepción anula la autorización y Carlos figura oficialmente en BAJA.  
> - **Opción B (Acuerdo Específico)**: La Autorización prevalece sobre la excepción (comportamiento actual del código).  
> **Estado**: **NO DEFINIDO — REQUIERE DECISIÓN HUMANA.**

### BLOQUEO 2: Política de Mutabilidad del Pasado (Congelación vs Recálculo)
> **Problema**: Si un gestor modifica hoy el ciclo de rotación de un grupo:  
> - **Opción A (Recálculo perpetuo)**: El cambio se proyecta hacia atrás en el tiempo, alterando cuadrantes de meses pasados (comportamiento actual).  
> - **Opción B (Vigencia temporal)**: La regla tiene una fecha de entrada en vigor y los cuadrantes pasados quedan congelados como registros inmutables.  
> **Estado**: **NO DEFINIDO — REQUIERE DECISIÓN HUMANA.**

### BLOQUEO 3: Modelado de la Modificación Oficial
> **Problema**: Para reflejar que una solicitud fue aprobada:  
> - **Opción A**: Crear una entidad formal `Modificacion` o resolver el resultado directamente leyendo `Autorizacion`.  
> - **Opción B**: Continuar mutando la entidad `Asignacion` inyectando etiquetas `'MODIFICACION_AUTORIZADA'` (comportamiento actual).  
> **Estado**: **NO DEFINIDO — REQUIERE DECISIÓN HUMANA.**

### BLOQUEO 4: Gobernanza de la Importación Excel frente a Cambios Autorizados
> **Problema**: Cuando una empresa sube un archivo Excel mensual:  
> - ¿Debe el Excel tener prohibido de forma inviolable sobreescribir acuerdos autorizados formalmente?  
> - ¿O debe permitirse que el gestor fuerce la sobreescritura si el Excel representa el cuadrante consolidado oficial de Recursos Humanos?  
> **Estado**: **NO DEFINIDO — REQUIERE DECISIÓN HUMANA.**

---

## 15. ELEMENTOS CONSERVABLES

Los siguientes componentes del repositorio poseen una alta calidad de diseño y pueden conservarse íntegramente como base técnica y de referencia:

1. **Arquitectura Física en Capas**: La separación entre `domain`, `usecases`, `data` y `components` es limpia, legible y respeta el Principio 2 del *README.md*.
2. **Motor Matemático Modular (`rotationCalculator.ts`)**: Funciones puras con aritmética modular agnóstica de librerías externas y manejo estricto de fechas en formato UTC para evitar anomalías de cambio horario.
3. **Aislamiento Multi-empresa**: La partición de todas las entidades y operaciones mediante `empresaId`.
4. **Principio de Resolución Dinámica (`officialScheduleResolver.ts`)**: El concepto arquitectónico de resolver el Resultado Oficial bajo demanda mediante funciones puras, evitando matrices estáticas redundantes.
5. **Módulo de Historial Inmutable (`HistorialEvento`)**: Estructura de auditoría adecuada para la trazabilidad de eventos.
6. **Diseño de Interfaz de Usuario**: Los componentes de visualización del cuadrante matricial, modal de solicitudes y catálogo de turnos son excelentes como referencia de experiencia de usuario.

---

## 16. ELEMENTOS QUE REQUIEREN REVISIÓN

Componentes que no deben desecharse pero requieren refactorización o ajuste una vez consensuadas las decisiones bloqueantes:

1. **`src/domain/rules/officialScheduleResolver.ts`**: Reordenar la cascada de prioridades para corregir el conflicto entre Excepciones y Autorizaciones según la política que se determine.
2. **`src/domain/types.ts`**:
   - Desacoplar la entidad `Asignacion` eliminando su sobrecarga funcional.
   - Flexibilizar los enums hardcodeados (`TipoSolicitud`, `TipoExcepcion`, `RolUsuario`).
3. **`src/usecases/solicitudesUseCases.ts`**:
   - Extraer la lógica que genera asignaciones autorizadas para dotarla de una semántica de dominio más limpia.
   - Reforzar el caso de uso de permutas para validar cualificaciones profesionales compatibles.
4. **`src/usecases/excelUseCases.ts`**:
   - Ajustar las reglas de colisión de acuerdo a la jerarquía oficial acordada.
5. **`src/data/storage.ts`**:
   - Mantenerlo como repositorio provisional para desarrollo local, documentando explícitamente que carece de soporte transaccional ACID concurrente para producción.

---

## 17. PLAN DE TRANSICIÓN

Para transicionar de forma controlada desde el prototipo actual hacia una arquitectura consolidada, se propone el siguiente itinerario en cuatro pasos:

```
[ PASO 1: VALIDACIÓN HUMANA ]
Responder formalmente a las 4 Decisiones Bloqueantes identificadas en la Sección 14.
        ↓
[ PASO 2: CONCILIACIÓN DEL DOCUMENTO RECTOR (README.md) ]
Actualizar el README.md para reflejar:
- La jerarquía oficial de precedencia validada.
- El alcance formal de las entidades maestras.
- La transición de la Fase 1 (Fundación) a la Fase 2 (Modelo de Dominio).
        ↓
[ PASO 3: AJUSTE DEL MODELO DE DOMINIO Y RESOLVER ]
- Adaptar las firmas de tipos en src/domain/types.ts.
- Actualizar el orden de evaluación en src/domain/rules/officialScheduleResolver.ts.
- Verificar que las pruebas funcionales de cálculo sigan siendo puras y agnósticas.
        ↓
[ PASO 4: ALINEACIÓN DE CASOS DE USO Y PERSISTENCIA ]
- Ajustar solicitudesUseCases, excepcionesUseCases y excelUseCases para alinearlos con el nuevo resolver.
- Conservar los componentes React existentes vinculándolos al dominio ajustado.
```

---

## 18. CONCLUSIÓN

El repositorio de **MIS TURNOS** posee una base técnica sólida, modular y bien estructurada, pero **avanzó en su implementación asumiendo supuestos de negocio que alteran la jerarquía laboral y la consistencia histórica del sistema**. 

El presente informe formaliza la **Fase 1A de Consolidación del Dominio**:
- Se ha documentado minuciosamente el comportamiento real del código sin alterar ningún archivo.
- Se han deslindado las reglas respaldadas de los supuestos del prototipo.
- Se han aislado las cuatro decisiones bloqueantes indispensables para continuar.

El proyecto permanece en estado de **CONGELACIÓN CONCEPTUAL** a la espera de las resoluciones humanas pertinentes.
