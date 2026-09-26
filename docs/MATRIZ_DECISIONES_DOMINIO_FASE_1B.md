# MATRIZ DE DECISIONES DE DOMINIO — FASE 1B
## PROYECTO: MIS TURNOS PLATFORM

---

## 1. OBJETIVO

El objetivo de esta Fase 1B es transformar los hallazgos analíticos de la Fase 1A en una **matriz estructurada de decisiones de negocio**, despojando al modelo de los sesgos y reducciones binarias prematuras introducidos en fases anteriores, con el fin de preparar las bases conceptuales para el futuro **CONTRATO DE DOMINIO v1**.

En cumplimiento estricto de las directrices:
- No se altera el código fuente, la configuración ni el documento rector.
- No se eligen soluciones ni se adoptan reglas de negocio en nombre del usuario.
- Se clasifican las decisiones de manera neutral identificando qué dimensión conceptual compete resolver al criterio humano.

---

## 2. FUENTES UTILIZADAS

Para este análisis se han considerado exclusivamente las siguientes fuentes:
1. **Documento Rector (`README.md`)**: Marco vinculante, principios fundamentales y delimitación de fases.
2. **Documento de Consolidación del Dominio (`docs/CONSOLIDACION_DOMINIO_FASE_1A.md`)**: Inventario de conceptos, estado real del código, temporalidad y contradicciones detectadas.
3. **Código fuente existente (`src/domain/*`, `src/usecases/*`, `src/data/*`)**: Empleado única y estrictamente como **evidencia de comportamiento técnico previo**, sin concederle autoridad de negocio.

---

## 3. REVISIÓN DE DECISIONES FASE 1A

Se analiza individualmente cada una de las 10 decisiones catalogadas en la Fase 1A, evaluando su naturaleza, pertinencia e impacto en el modelo de dominio.

---

### DEC-01: Prevalencia entre Excepción y Modificación Autorizada

1. **¿Es realmente una decisión de dominio?**: **SÍ**. Define qué acontecimiento legal o laboral tiene primacía sobre la jornada de un trabajador.
2. **¿Bloquea el modelo de dominio?**: **SÍ**. El algoritmo de resolución del Resultado Oficial no puede formularse sin saber qué fuente rige cuando concurren una ausencia/licencia y un cambio acordado.
3. **¿Debe resolverse ahora?**: **SÍ**. Es indispensable para la coherencia del motor de resolución básico.
4. **¿Puede posponerse?**: **NO**.
5. **¿La formulación actual es neutral?**: **NO**. En fases previas se planteó como un dilema cerrado ("o siempre gana la excepción o siempre gana la autorización").
6. **¿Gemini introdujo opciones que no necesariamente representan todas las posibilidades?**: **SÍ**. Ignoró que la solución puede depender del tipo de excepción (baja médica sobrevenida vs vacaciones previamente pactadas), de la cronología de los registros o de la naturaleza del cambio autorizado.

---

### DEC-02: Mutabilidad del Pasado / Congelación Histórica

1. **¿Es realmente una decisión de dominio?**: **SÍ**. Dictamina si los cuadrantes pasados son inmutables tras el cierre de período o si admiten recálculo algorítmico retroactivo.
2. **¿Bloquea el modelo de dominio?**: **SÍ**. Determina si el Resultado Oficial histórico es un cálculo dinámico o un registro congelado en el tiempo.
3. **¿Debe resolverse ahora?**: **PARCIAL**. No es imprescindible definir todo el ciclo de nómina ahora, pero sí definir si las consultas hacia fechas pasadas pueden ser recalculadas por el motor.
4. **¿Puede posponerse?**: **PARCIAL**. Los mecanismos de "cierre formal" pueden esperar; el principio de inmutabilidad del pasado debe acordarse.
5. **¿La formulación actual es neutral?**: **PARCIAL**.
6. **¿Gemini introdujo opciones que no necesariamente representan todas las posibilidades?**: **SÍ**. Redujo el problema a "recálculo perpetuo vs congelación masiva", omitiendo esquemas de versionado, estados de cuadrante (borrador, publicado, consolidado) o bloqueos selectivos por fechas de corte.

---

### DEC-03: Naturaleza de la Asignación Manual

1. **¿Es realmente una decisión de dominio?**: **SÍ**. Aclara qué significa que un gestor intervenga directamente sobre una fecha: si es una orden puntual o una alteración de la regla estructural.
2. **¿Bloquea el modelo de dominio?**: **SÍ**. Afecta a la relación entre la planificación base por rotación y las órdenes directas de supervisión.
3. **¿Debe resolverse ahora?**: **SÍ**.
4. **¿Puede posponerse?**: **NO**.
5. **¿La formulación actual es neutral?**: **PARCIAL**.
6. **¿Gemini introdujo opciones que no necesariamente representan todas las posibilidades?**: **SÍ**. Se asumió como una sobreescritura directa en la misma tabla de asignaciones sin considerar si requiere motivo, si es una excepción puntual de un día o si supone un cambio de patrón contractual.

---

### DEC-04: Papel de Excel

1. **¿Es realmente una decisión de dominio?**: **PARCIAL**. La mecánica de importación es técnica, pero la autoridad del dato importado frente a datos existentes es una regla de dominio.
2. **¿Bloquea el modelo de dominio?**: **NO**. El dominio central (planificación, excepciones, solicitudes y resultado oficial) puede definirse independientemente del formato de intercambio Excel.
3. **¿Debe resolverse ahora?**: **NO**.
4. **¿Puede posponerse?**: **SÍ**. Se puede modelar primero el dominio y luego definir las políticas de importación como adaptadores de entrada.
5. **¿La formulación actual es neutral?**: **SÍ**. Se identificaron diversas naturalezas posibles.
6. **¿Gemini introdujo opciones que no necesariamente representan todas las posibilidades?**: **SÍ**. Planteó el dilema centrado en el botón "proteger autorizados" del prototipo, lo cual es un artefacto de interfaz y no una regla conceptual.

---

### DEC-05: Comportamiento de una Permuta ante Cambios Posteriores

1. **¿Es realmente una decisión de dominio?**: **SÍ**. Determina el alcance del vínculo bilateral entre dos empleados cuando sobreviene una causa de fuerza mayor en uno de ellos.
2. **¿Bloquea el modelo de dominio?**: **NO**. Es una regla de gestión de incidencias de segundo orden dentro del flujo de permutas.
3. **¿Debe resolverse ahora?**: **NO**.
4. **¿Puede posponerse?**: **SÍ**. Basta inicialmente con definir qué es una permuta aprobada en condiciones ordinarias.
5. **¿La formulación actual es neutral?**: **SÍ**.
6. **¿Gemini introdujo opciones que no necesariamente representan todas las posibilidades?**: **SÍ**. Enfocó la discusión en fallos de transaccionalidad técnica del array en lugar de en la política de negocio laboral ante ausencias sobrevenidas.

---

### DEC-06: Regla Individual para Empleado Rotativo sin Grupo

1. **¿Es realmente una decisión de dominio?**: **SÍ**. Define si la rotación pertenece ontológicamente al Grupo o al Contrato/Empleado.
2. **¿Bloquea el modelo de dominio?**: **NO**. En el README el Grupo es la entidad natural para organizar rotaciones compartidas; admitir rotaciones individuales aisladas es una extensión.
3. **¿Debe resolverse ahora?**: **NO**.
4. **¿Puede posponerse?**: **SÍ**. Mantener la asociación Grupo-Rotación como baseline satisface el alcance inicial sin bloquear.
5. **¿La formulación actual es neutral?**: **SÍ**.
6. **¿Gemini introdujo opciones que no necesariamente representan todas las posibilidades?**: **NO**. La pregunta refleja adecuadamente la disyuntiva de relación de entidades.

---

### DEC-07: Días de Descanso de Empleados Fijos

1. **¿Es realmente una decisión de dominio?**: **SÍ**. Trata sobre la definición de la jornada semanal para empleados fijos.
2. **¿Bloquea el modelo de dominio?**: **NO**.
3. **¿Debe resolverse ahora?**: **NO**.
4. **¿Puede posponerse?**: **SÍ**. Puede asumirse provisionalmente que un empleado fijo tiene una pauta de trabajo/descanso configurable por parámetros, sin exigir un modelo exhaustivo de convenios en esta fase.
5. **¿La formulación actual es neutral?**: **SÍ**.
6. **¿Gemini introdujo opciones que no necesariamente representan todas las posibilidades?**: **SÍ**. Se concentró en denunciar el hardcodeo de `[0, 6]` (sábado y domingo), cuando lo relevante es si el descanso es parte del turno fijo o un atributo del contrato.

---

### DEC-08: Catálogo de Solicitudes y Excepciones

1. **¿Es realmente una decisión de dominio?**: **PARCIAL**. Define si los tipos de solicitud/excepción son un vocabulario cerrado del sistema o un catálogo dinámico por empresa.
2. **¿Bloquea el modelo de dominio?**: **NO**.
3. **¿Debe resolverse ahora?**: **NO**.
4. **¿Puede posponerse?**: **SÍ**. El motor de resolución solo necesita saber qué efectos produce una solicitud o excepción, con independencia de si sus nombres son fijos o configurables.
5. **¿La formulación actual es neutral?**: **SÍ**.
6. **¿Gemini introdujo opciones que no necesariamente representan todas las posibilidades?**: **SÍ**. Confundió la necesidad de catalogar con la necesidad de crear un CRUD administrativo en la Fase 1.

---

### DEC-09: Roles y Autorización

1. **¿Es realmente una decisión de dominio?**: **SÍ**. Define quién tiene potestad para aprobar qué peticiones.
2. **¿Bloquea el modelo de dominio?**: **NO**.
3. **¿Debe resolverse ahora?**: **NO**.
4. **¿Puede posponerse?**: **SÍ**. El modelo del Resultado Oficial solo necesita saber que existe un "acto de autorización formal", independientemente de si el rol es Gestor, Supervisor o Administrador.
5. **¿La formulación actual es neutral?**: **SÍ**.
6. **¿Gemini introdujo opciones que no necesariamente representan todas las posibilidades?**: **SÍ**. Criticó el enum existente de 3 roles sin notar que la matriz de permisos detallada corresponde a la etapa de Gestión y Seguridad.

---

### DEC-10: Fecha de Aprobación vs Fecha de Efectividad

1. **¿Es realmente una decisión de dominio?**: **SÍ**. Establece si una solicitud aprobada surte efecto inmediato o si depende de una fecha de publicación o vigencia programada.
2. **¿Bloquea el modelo de dominio?**: **SÍ**. Afecta directamente al estado y cálculo del Resultado Oficial en el tiempo.
3. **¿Debe resolverse ahora?**: **SÍ**.
4. **¿Puede posponerse?**: **NO**.
5. **¿La formulación actual es neutral?**: **SÍ**.
6. **¿Gemini introdujo opciones que no necesariamente representan todas las posibilidades?**: **PARCIAL**. Planteó el concepto con claridad, distinguiendo la resolución administrativa del impacto operativo.

---

## 4. RESULTADO OFICIAL Y CADENA CONCEPTUAL

Para comprender el ciclo de vida del dato antes de plasmarlo en un contrato, debe descomponerse la cadena causal:

```
[ 1. PLANIFICACIÓN BASE ]
           ↓
[ 2. SOLICITUD ]
           ↓
[ 3. AUTORIZACIÓN ]
           ↓
[ 4. APLICACIÓN EFECTIVA ]
           ↓
[ 5. RESULTADO OFICIAL ]
           ↓
[ 6. HISTORIAL ]
```

### Análisis conceptual de los eslabones:

- **1. Planificación Base**: La hipótesis teórica u ordinaria de trabajo derivada del patrón rotativo o del turno fijo del empleado. No presupone incidentes ni acuerdos puntuales.
- **2. Solicitud**: Una pretensión o petición formal que no altera las obligaciones vigentes por sí misma; constituye una expectativa legítima sujeta a resolución.
- **3. Autorización**: La manifestación de la potestad directiva que aprueba o deniega la pretensión. **No equivale forzosamente a la aplicación inmediata del cambio en la cuadrícula**.
- **4. Aplicación Efectiva**: El momento en que la autorización se materializa operativamente. Puede ser:
  - *Inmediata*: Al pulsar aprobar, el cambio impacta el turno del día afectado.
  - *Diferida/Programada*: Aprobada hoy, pero con efectos a partir de cierta fecha.
  - *Condicionada a Publicación*: No vincula hasta que el cuadrante mensual sea publicado formalmente por la dirección.
- **5. Resultado Oficial**: La síntesis jurídica y operativa vinculante para un empleado en una fecha dada. Es el turno exigible y computable ante la empresa y las autoridades laborales.
- **6. Historial**: El registro inmutable y cronológico que audita qué eventos provocaron que el Resultado Oficial difiriera de la Planificación Base o de un Resultado Oficial anterior.

> **CONCLUSIÓN CONCEPTUAL**: La cadena actual del prototipo omite el eslabón de la **Aplicación Efectiva**, colapsando la "Autorización" directamente en la "Asignación". Esta omisión debe ser esclarecida en el Contrato de Dominio.

---

## 5. TEMPORALIDAD

El análisis de la dimensión temporal demuestra que un sistema de turnos no opera en un espacio atemporal, sino bajo múltiples líneas temporales que conviven simultáneamente:

### Diferenciación rigurosa de fechas:
1. **Fecha del Evento (`fechaAfectada`)**: El día del calendario en el que el empleado debe o no trabajar el turno (ej. el 15 de octubre).
2. **Fecha de Registro (`fechaCreacion` / `timestamp`)**: El instante exacto en que una entidad o solicitud ingresó al sistema informático (ej. el 2 de octubre a las 10:14 UTC).
3. **Fecha de Decisión / Autorización**: El momento en que el supervisor emitió su dictamen formal (ej. el 4 de octubre a las 16:30 UTC).
4. **Fecha de Efectividad**: El momento a partir del cual el cambio surte efectos jurídicos u operativos en el cuadrante.
5. **Fecha de Consulta**: El momento en que un usuario o proceso pregunta al sistema: *"¿Qué turno tiene Carlos el 15 de octubre?"*.
6. **Fecha Histórica**: Estados previos que tuvo el cuadrante antes de ser alterado por modificaciones posteriores.

### Conceptos que requieren vigencia temporal:
- **Empleado**: Requiere vigencia de estado (fecha de alta, fecha de baja) y vigencia de asignación a grupo (desde/hasta).
- **Grupo y Regla de Rotación**: La regla asignada a un grupo no puede ser retroactiva universal; requiere una fecha de inicio de vigencia de la pauta.
- **Excepción**: Posee inherentemente vigencia temporal definida por un rango continuo `[fechaInicio, fechaFin]`.
- **Resultado Oficial**: Requiere delimitar si para fechas pasadas a la fecha actual de consulta se considera inmutable (congelado) o recalculable.

---

## 6. HISTORIAL

El término "Historial" en el código actual mezcla múltiples intenciones de auditoría. Es imperativo deslindar cinco conceptos distintos:

- **A. Historial de eventos administrativos**: Bitácora documental de peticiones, aprobaciones, rechazos y cancelaciones (quién solicitó qué y quién aprobó).
- **B. Historial del Resultado Oficial**: Serie temporal de los cambios de turno que ha experimentado una fecha concreta (ej. el 15 de octubre Carlos pasó de Turno 2 a Turno 1, y luego a Libre).
- **C. Historial de modificaciones de configuración**: Auditoría de cambios sobre maestros (ej. quién cambió el horario de un turno o el desfase de un grupo).
- **D. Auditoría técnica**: Trazas de sistema, conexiones, IPs o errores (técnico, fuera del dominio).
- **E. Registro de lo que realmente ocurrió (Presencia real)**: Picajes, fichajes reales o justificaciones presenciales (dominio de control horario, no de planificación).

> **DIAGNÓSTICO**: El *README.md* respalda con claridad el concepto **A (Eventos Administrativos)** y el concepto **B (Trazabilidad de cambios sobre el turno del empleado)**. Los conceptos D y E no pertenecen a la fase de planificación de turnos.

---

## 7. ASIGNACIÓN

### Diagnóstico del concepto "Asignación" en el código:
En la implementación actual, la entidad `Asignacion` actúa como un **cajón de sastre técnico** que almacena bajo una misma tabla:
1. Una asignación manual puntual introducida por un gestor en el cuadrante.
2. La carga masiva procedente de un archivo Excel.
3. El resultado materializado de una solicitud aprobada (`MODIFICACION_AUTORIZADA`).
4. La asignación ordinaria de un empleado fijo.

### Problema de la mezcla conceptual:
- **Pérdida del estado original**: Al sobreescribir la fila en `Asignacion`, el sistema no puede responder limpiamente a: *"¿Qué le correspondía originalmente al empleado antes de la modificación autorizada?"* sin forzar un recálculo hipotético de la rotación.
- **Ambigüedad de precedencia**: Un registro en `Asignacion` compite contra otros registros en la misma tabla mediante discriminadores de texto (`origen`), lo que fragiliza la integridad referencial y las consultas analíticas.
- **Confusión entre intención y orden**: No distingue entre una orden jerárquica directa (gestor que asigna) y un pacto concedido (solicitud del trabajador autorizada).

---

## 8. EXCEPCIONES

### Característica común:
Toda excepción es una **circunstancia formal sobrevenida o programada que suspende temporalmente la obligación de realizar la jornada ordinaria planificada**.

### Diferencias conceptuales de negocio fundamentales:
No todas las excepciones tienen la misma naturaleza ni la misma jerarquía jurídica:
1. **Incapacidad Temporal / Fuerza Mayor (Bajas médicas, accidentes)**:
   - Derivan de prescripción médica o legal imperativa.
   - Son indisponibles para la empresa y el empleado: no pueden ser objeto de permuta, ni de trabajo ordinario, ni de compensación durante su vigencia.
2. **Permisos y Licencias Retribuidas (Matrimonio, fallecimiento, deber inexcusable)**:
   - Derivan de derechos estatutarios con justificación documental.
3. **Vacaciones Anuales**:
   - Concesión pactada en un calendario anual. Suelen ser conocidas con alta antelación.
4. **Modificaciones Temporales Operativas (Refuerzo, comisión de servicio)**:
   - No suspenden el trabajo; cambian temporalmente las condiciones del servicio.

> **IMPACTO EN EL DOMINIO**: Tratar todas las excepciones de forma idéntica ante una solicitud aprobada es un error conceptual. Una baja médica sobrevenida debe desplazar a una solicitud de cambio de turno previamente autorizada.

---

## 9. EXCEL

### Definición conceptual pendiente:
Antes de codificar reglas de importación/exportación de Excel, es imprescindible responder a una única pregunta de negocio:
**¿Qué representa un archivo Excel en el ecosistema de la empresa?**

- **Interpretación 1: Fuente Externa Primaria (Legacy Master)**:
  La empresa planifica sus cuadrantes en herramientas externas o ERPs centrales y utiliza MIS TURNOS exclusivamente como visor para empleados y canal de tramitación de incidencias.
- **Interpretación 2: Carga Inicial de Arranque (Bootstrapping)**:
  El Excel se usa una sola vez para volcar la plantilla histórica de turnos y, a partir de ese momento, la base de datos de MIS TURNOS asume la titularidad de los datos.
- **Interpretación 3: Intercambio y Respaldo Operativo**:
  MIS TURNOS es la fuente de verdad absoluta; el Excel es solo un artefacto de salida (exportación) o una vía de contingencia para gestores que operan sin conexión.

> **CONCLUSIÓN**: El *README.md* (Principio 5) zanja este debate al declarar: *"Excel es mecanismo de importación/exportación, no fuente de verdad."*. Por tanto, el Excel no puede usurpar las reglas internas del dominio ni destruir acuerdos autorizados registrados en la plataforma.

---

## 10. PERMUTAS

### Descomposición de etapas conceptuales:
Una permuta entre dos trabajadores no es un simple intercambio de dos turnos en una base de datos; atraviesa fases diferenciadas:
1. **Solicitud de Permuta**: Manifestación bilateral donde un trabajador propone intercambiar una jornada con otro compañero específico en fechas determinadas.
2. **Consentimiento del Compañero**: ¿Requiere la aceptación explícita del compañero destinatario antes de pasar a la supervisión, o el solicitante formula la petición asumiendo el acuerdo previo?
3. **Autorización de la Permuta**: La supervisión evalúa la viabilidad organizativa del intercambio (cobertura, límites de descanso entre jornadas, compatibilidad de puestos).
4. **Aplicación Efectiva**: La permuta entra en vigor y modifica el Resultado Oficial de ambos empleados de manera coordinada.
5. **Resultado Oficial Posterior**: Cada empleado pasa a deber el turno intercambiado.
6. **Historial de la Permuta**: Asiento de auditoría que documenta el cruce formal.

### Distinción entre Regla de Negocio y Validación Técnica:
- **Reglas de Negocio (Políticas de la Empresa)**:
  - ¿Pueden permutar empleados de distintos grupos o puestos?
  - ¿Deben ser permutas en la misma semana/mes para no descompensar el cómputo de horas de nómina?
  - ¿Qué sucede si uno enferma posteriormente?
- **Validaciones Técnicas (Integridad del Software)**:
  - Formato de fechas válido.
  - Verificación de que los identificadores de empleado correspondan a la misma empresa.
  - Consistencia de actualización en el almacenamiento.

---

## 11. DECISIONES PREMATURAS O DEMASIADO CERRADAS

En las fases preliminares se incurrió en reducciones conceptuales que deben corregirse:

1. **Reducción binaria de Excepción vs Autorización**: Reducir la precedencia a "siempre gana A o siempre gana B" ignora la naturaleza jurídica de la causa médica frente a la vacación pactada.
2. **Asignación como concepto universal**: Asumir que toda determinación de turno es una fila en la tabla `Asignacion` cegó la diferencia entre rotación, orden de mando y autorización.
3. **Inmutabilidad estricta vs Recálculo total**: Plantear que el pasado se recalcula siempre o se congela de golpe, ignorando modelos graduales de estados de publicación de cuadrantes.
4. **Atomicidad técnica como garantía mágica**: Confundir una secuencia de código procedural en JavaScript con una garantía de atomicidad transaccional de negocio.
5. **Tipos cerrados de excepción y solicitud**: Asumir enums fijos de TypeScript como axiomas de negocio inamovibles.

---

## 12. OMISIONES DETECTADAS

Durante esta auditoría se han identificado **tres omisiones conceptuales críticas** no señaladas en los análisis previos:

### OMISIÓN DETECTADA 1: Estados del Cuadrante (Ciclo de Vida de la Planificación)
El sistema actual asume que los turnos son visibles y oficiales de forma perpetua. No existe el concepto de **Estado del Cuadrante**:
- *Borrador* (el gestor está cuadrando descansos y turnos).
- *Publicado / Vigente* (el cuadrante adquiere fuerza vinculante y los empleados pueden planificar su vida personal).
- *Consolidado / Cerrado* (el mes finaliza y los datos pasan a nómina o histórico, quedando bloqueados ante cualquier recálculo algorítmico).

### OMISIÓN DETECTADA 2: Límites Legales de Descanso y Jornada
El código resuelve turnos y permutas de forma aislada día por día. No evalúa si un cambio autorizado o una asignación manual infringe normativas laborales elementales:
- Descanso mínimo obligatorio entre jornadas consecutivas (ej. turno de noche seguido inmediatamente de turno de mañana al día siguiente).
- Máximo de días consecutivos de trabajo sin descanso.

### OMISIÓN DETECTADA 3: Consentimiento del Segundo Empleado en Permutas
En el prototipo actual, el Empleado A solicita una permuta con el Empleado B, y el gestor puede aprobarla directamente sin que el Empleado B haya aceptado la propuesta en el sistema.

---

## 13. MATRIZ FINAL DE DECISIONES

A continuación se resume el inventario completo bajo la escala estricta solicitada:

| ID | Decisión de Negocio | ¿Dominio? | ¿Bloqueante? | ¿Resolver Ahora? | ¿Puede Esperar? | ¿Introducida por Gemini? | Nivel de Impacto | Qué Necesitamos Definir |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **DEC-01** | Jerarquía entre Excepción sobrevenida y Modificación Autorizada | SÍ | SÍ | SÍ | NO | SÍ | Crítico | Si la naturaleza de la excepción (fuerza mayor vs programada) determina su prevalencia sobre una autorización previa. |
| **DEC-02** | Política de mutabilidad y recálculo de fechas pasadas | SÍ | SÍ | SÍ | NO | PARCIAL | Crítico | Si el Resultado Oficial pasado es inmutable o si admite recálculo algorítmico retroactivo. |
| **DEC-03** | Naturaleza y alcance de la Asignación Manual | SÍ | SÍ | SÍ | NO | SÍ | Alto | Si la asignación manual es una corrección puntual de un día o una nueva regla que altera el ciclo del empleado. |
| **DEC-04** | Autoridad ontológica del dato importado de Excel | PARCIAL | NO | NO | SÍ | SÍ | Medio | Si Excel actúa como carga de inicio o si tiene potestad para desplazar asignaciones del sistema. |
| **DEC-05** | Tratamiento de permutas ante contingencias sobrevenidas | SÍ | NO | NO | SÍ | SÍ | Medio | Si la baja médica o despido de un participante anula el intercambio o mantiene el turno al otro compañero. |
| **DEC-06** | Adscripción de reglas de rotación (Grupo vs Empleado) | SÍ | NO | NO | SÍ | NO | Medio | Si un empleado rotativo puede tener un patrón sin pertenecer a un Grupo. |
| **DEC-07** | Modelo de descansos para empleados fijos | SÍ | NO | NO | SÍ | SÍ | Bajo | Dónde residen los descansos fijos (en la definición del turno o en el contrato del empleado). |
| **DEC-08** | Naturaleza del catálogo de tipos de solicitud y excepción | PARCIAL | NO | NO | SÍ | SÍ | Bajo | Si los motivos son un vocabulario cerrado del sistema o maestros configurables por empresa. |
| **DEC-09** | Granularidad de roles y jerarquía de aprobación | SÍ | NO | NO | SÍ | SÍ | Medio | Matriz de permisos de supervisores para autorizar peticiones. |
| **DEC-10** | Distinción entre Resolución Administrativa y Aplicación Efectiva | SÍ | SÍ | SÍ | NO | PARCIAL | Alto | Si una solicitud aprobada surte efecto inmediato o requiere publicación formal del cuadrante. |
| **OMI-01** | Estados de vigencia del cuadrante (Borrador / Publicado / Cerrado) | SÍ | SÍ | SÍ | NO | NO | Crítico | Si existe un ciclo de vida para el cuadrante mensual antes de ser vinculante e inmutable. |
| **OMI-02** | Validación de descansos mínimos entre jornadas en cambios | SÍ | NO | NO | SÍ | NO | Alto | Si el sistema debe bloquear turnos incompatibles o limitarse a registrar la voluntad del supervisor. |
| **OMI-03** | Aceptación del compañero en solicitudes de permuta | SÍ | NO | NO | SÍ | NO | Medio | Si el flujo de permuta exige validación bilateral de ambos trabajadores antes del visto bueno del gestor. |

---

## 14. DECISIONES MÍNIMAS QUE REQUIEREN VALIDACIÓN HUMANA

Para poder formular el **CONTRATO DE DOMINIO v1** sin incurrir en supuestos arbitrarios, se requiere la intervención humana exclusivamente sobre estas **cuatro decisiones mínimas**:

---

### DECISIÓN 1: Prevalencia ante Concurrencia de Excepción Médica y Modificación Autorizada

- **Pregunta de dominio**: Si un empleado tiene autorizada previamente una modificación para trabajar en una fecha y sobreviene una baja médica acreditada (incapacidad temporal) para ese mismo día, ¿cuál es el Resultado Oficial del empleado?
- **Por qué importa**: Determina si el sistema respeta la legalidad laboral y la fuerza mayor o si trata todas las entradas como simples códigos equivalentes en una cuadrícula.
- **Qué conceptos afecta**: `Excepcion`, `Autorizacion`, `TurnoOficialDia`, `Historial`.
- **Qué NO necesitamos decidir todavía**: El catálogo completo de tipos de enfermedad, los baremos médicos o los flujos de alta/baja de la Seguridad Social.
- **Estado**: **REQUIERE DECISIÓN HUMANA**.

---

### DECISIÓN 2: Mutabilidad del Cuadrante Pasado

- **Pregunta de dominio**: ¿Pueden los cuadrantes de fechas pasadas modificarse o recalcularse automáticamente si un gestor edita hoy la regla de rotación de un grupo, o el pasado queda estrictamente congelado e inalterable?
- **Por qué importa**: Define si el Resultado Oficial histórico es un valor fijo e inmutable en el tiempo o una función matemática volátil. Afecta directamente al cierre de nóminas y a la trazabilidad legal.
- **Qué conceptos afecta**: `ReglaRotacion`, `Grupo`, `TurnoOficialDia`, `Historial`.
- **Qué NO necesitamos decidir todavía**: La integración contable con sistemas de nómina externos o el formato de exportación a PDF.
- **Estado**: **REQUIERE DECISIÓN HUMANA**.

---

### DECISIÓN 3: Alcance Temporal de la Asignación Manual Directa

- **Pregunta de dominio**: Cuando un gestor cambia manualmente el turno de un empleado rotativo en una fecha específica desde el cuadrante, ¿esta acción se interpreta como una enmienda puntual exclusivamente para ese día concreto o como una alteración de su ciclo de rotación a futuro?
- **Por qué importa**: Evita corromper el motor de rotación continuo por intervenciones operativas puntuales de supervisión diaria.
- **Qué conceptos afecta**: `Asignacion`, `Planificacion`, `ReglaRotacion`, `TurnoOficialDia`.
- **Qué NO necesitamos decidir todavía**: Si el gestor debe firmar digitalmente el cambio o si se requieren flujos de doble autorización interna.
- **Estado**: **REQUIERE DECISIÓN HUMANA**.

---

### DECISIÓN 4: Efectividad Operativa de la Autorización

- **Pregunta de dominio**: Cuando un supervisor aprueba una solicitud de un empleado, ¿el Resultado Oficial del cuadrante cambia inmediatamente en tiempo real, o el cambio queda en estado "aprobado pero no efectivo" hasta que el cuadrante correspondiente sea formalmente publicado?
- **Por qué importa**: Establece si existe el concepto de "Publicación de Cuadrante" como frontera de efectividad jurídica o si el sistema opera bajo reactividad continua en tiempo real.
- **Qué conceptos afecta**: `Solicitud`, `Autorizacion`, `AplicacionEfectiva`, `TurnoOficialDia`.
- **Qué NO necesitamos decidir todavía**: Los canales de notificación (email, SMS, push) o las pantallas visuales del supervisor.
- **Estado**: **REQUIERE DECISIÓN HUMANA**.

---

## 15. CONCEPTOS PREPARADOS PARA EL CONTRATO DE DOMINIO v1

Se segregan los conceptos del dominio de acuerdo a su madurez para formar parte del Contrato de Dominio v1:

### A. YA DEFINIDO (Listo para incorporarse al Contrato de Dominio)
- **Aislamiento Multi-empresa**: Toda entidad y operación está estrictamente delimitada por `empresaId`.
- **Catálogo de Turnos**: Definición de turnos con identificador, código, jornada computable y bandera de descanso/libre (`esLibre`).
- **Planificación Base por Rotación**: Algoritmo modular cíclico puro fundamentado en días transcurridos y longitud de secuencia.
- **Modalidades Laborales**: Coexistencia de empleados fijos y empleados adscritos a secuencias rotativas.
- **Naturaleza de la Solicitud Pendiente**: Una petición no confiere derechos ni altera el Resultado Oficial mientras esté pendiente.
- **Papel de Excel**: Mecanismo de entrada y salida, nunca fuente de verdad soberana.
- **Historial de Auditoría**: Asiento inmutable cronológico que documenta los cambios de estado formal.

### B. PENDIENTE DE DECISIÓN (Depende de las 4 decisiones mínimas de la Sección 14)
- **Regla de Resolución del Resultado Oficial**: Orden exacto de precedencia entre Excepciones Médicas, Autorizaciones y Planificación.
- **Inmutabilidad del Cuadrante Histórico**: Frontera temporal de congelación de resultados pasados.
- **Semántica de la Asignación Manual**: Alcance puntual de un solo día frente a la alteración del ciclo.
- **Separación entre Autorización y Aplicación Efectiva**: Impacto inmediato en el cuadrante vs condicionamiento a publicación formal.

### C. PUEDE ESPERAR (Para etapas posteriores: Gestión, Seguridad, Integraciones)
- Matriz detallada de roles, perfiles y permisos granulares de supervisión.
- Catálogo ampliado y personalizable de tipos de licencias por convenio colectivo.
- Protocolo bilateral de aceptación de permutas entre empleados.
- Reglas avanzadas de validación de descansos mínimos obligatorios entre jornadas.
- Políticas de colisión granular y mapeo de cabeceras en importaciones complejas de Excel.

---

## 16. CONCLUSIÓN

El proceso de auditoría y análisis de la Fase 1B permite concluir que:

1. **La base conceptual del proyecto está mayoritariamente madura y sana**: Los principios arquitectónicos de desacoplamiento, cálculo modular y trazabilidad documental son sólidos y están listos para preservarse.
2. **El bloqueo actual se concentra en cuatro dilemas de gobernanza laboral muy específicos** (prevalencia médica sobrevenida, inmutabilidad del pasado, alcance de la asignación manual y efectividad de la autorización).
3. **No se requiere rediseñar todo el sistema**: Al responder humanamente a las cuatro preguntas formuladas en la Sección 14, se dispondrá de todas las piezas necesarias para redactar de forma limpia, rigurosa y definitiva el **CONTRATO DE DOMINIO v1**, permitiendo desbloquear la evolución del código sin incertidumbres conceptuales.
