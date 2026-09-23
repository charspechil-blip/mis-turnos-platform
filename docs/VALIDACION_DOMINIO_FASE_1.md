# DOCUMENTO DE VALIDACIÓN DEL DOMINIO — FASE 1
## MIS TURNOS PLATFORM
### TEMA: RESULTADO OFICIAL Y PRECEDENCIA

---

## 1. INTRODUCCIÓN Y MARCO DE REFERENCIA

El presente documento analiza y descompone las reglas conceptuales relativas al **Resultado Oficial** y a los **Conflictos de Precedencia** en la plataforma **MIS TURNOS**. 

Siguiendo el mandato de congelación:
- **No se ha modificado, creado ni eliminado ningún archivo de código.**
- Las reglas encontradas en el código existente (`src/domain/rules/officialScheduleResolver.ts`, `solicitudesUseCases.ts`, etc.) se tratan exclusivamente como **comportamientos del prototipo técnico** y **supuestos no validados**, nunca como verdades definitivas del negocio.

---

## 2. DESCOMPOSICIÓN DE CONCEPTOS FUNDAMENTALES

Para evitar confusiones entre el modelo de negocio y las decisiones técnicas provisionales, separamos rigurosamente los siguientes ocho conceptos:

| Concepto | Significado Conceptual en el Negocio | Clasificación Actual en el Prototipo |
| :--- | :--- | :--- |
| **PLANIFICACIÓN** | Lo que en teoría corresponde a un empleado según las reglas organizativas base (ciclo de rotación de su grupo o turno habitual fijo). Es un cálculo proyectado en el tiempo. | **SUPUESTO DEL PROTOTIPO**: Calculado al vuelo como la capa base de menor prioridad. |
| **ASIGNACIÓN** | La determinación explícita de un turno para una fecha y empleado concretos introducida de forma manual por un gestor o mediante una carga masiva. | **IMPLEMENTACIÓN TÉCNICA**: Se persiste en una tabla genérica `Asignacion` con etiquetas de origen. |
| **SOLICITUD** | La manifestación de una petición formulada por un empleado (o en su nombre) para alterar su situación laboral en una fecha (libranza, cambio, permuta). | **DECISIÓN VALIDADA**: No altera por sí misma el turno oficial mientras no exista resolución. |
| **AUTORIZACIÓN** | La decisión formal emitida por un rol con autoridad que resuelve una solicitud (aprobando o rechazando la pretensión). | **IMPLEMENTACIÓN TÉCNICA**: Existe como registro documental, pero operativamente inyecta una fila en `Asignacion`. |
| **EXCEPCIÓN** | Una circunstancia jurídica o de fuerza mayor (vacaciones concedidas, baja médica, permiso retribuido) que suspende o altera la obligación de prestar el servicio ordinario durante un período. | **DECISIÓN NO VALIDADA**: Subordinada en el prototipo ante cualquier modificación autorizada. |
| **MODIFICACIÓN** | El acto o efecto de alterar lo planificado originalmente, ya sea por vía de autoridad jerárquica (gestión directa) o por resolución de una solicitud autorizada. | **SUPUESTO DEL PROTOTIPO**: No existe como entidad; se mezcla dentro de `Asignacion`. |
| **RESULTADO OFICIAL** | El turno y horario vinculante que legítimamente corresponde realizar al empleado en una fecha dada a efectos legales, operativos y retributivos. | **IMPLEMENTACIÓN TÉCNICA**: Objeto dinámico calculado en tiempo de ejecución por un resolver algorítmico. |
| **HISTORIAL** | El registro inmutable y cronológico de quién, cuándo y por qué alteró el estado de la planificación o resolvió una solicitud. | **DECISIÓN VALIDADA**: Trazabilidad documental de auditoría. |

---

## 3. PRIMERA PREGUNTA FUNDAMENTAL: ¿QUÉ SIGNIFICA "RESULTADO OFICIAL"?

### ¿Qué representa?
El **Resultado Oficial** representa la **verdad operativa vigente** de la empresa para un empleado en una fecha determinada. Es el turno al que el empleado debe presentarse físicamente o la condición de libranza/ausencia legal que le asiste ante la inspección de trabajo, el cómputo de nómina y el control de presencia.

### ¿Cuándo existe?
Existe **siempre** para cualquier empleado activo y fecha consultada. Si el sistema no puede encontrar una regla o intervención, el Resultado Oficial debe indicar un estado de "no planificado" o "descanso obligatorio", pero nunca puede ser nulo o indefinido.

### ¿Quién lo determina?
No lo determina una única persona, sino el **motor del sistema aplicando la política de gobernanza** de la empresa. En última instancia, refleja la voluntad de la persona con autoridad (vía planificación corporativa, asignación directa o aprobación formal).

### ¿De qué fuentes puede depender?
Puede derivar de:
1. Regla de rotación del grupo.
2. Contrato o pacto fijo individual.
3. Asignación directa introducida por un supervisor.
4. Carga externa de datos (ej. Excel).
5. Excepción reglamentaria o de salud (bajas médicas, permisos, vacaciones).
6. Solicitud tramitada y formalmente autorizada.

### ¿Es un dato almacenado o un resultado calculado?
- **En el prototipo actual**: Es un **resultado calculado dinámicamente** en memoria mediante `resolveOfficialScheduleForDay`.
- **Dilema de Dominio**: Si es exclusivamente calculado al vuelo, cualquier cambio retroactivo en una regla de rotación alteraría los cuadrantes pasados. Si es almacenado estáticamente (congelado día a día), pierde reactividad ante ajustes de ciclo. **Requiere decisión humana sobre si los cuadrantes pasados se congelan como registros históricos oficiales.**

### Relación con los demás conceptos
- **Con la Planificación**: La planificación es la propuesta o hipótesis inicial; el Resultado Oficial es el dictamen final tras considerar incidencias.
- **Con una Asignación**: La asignación es un vehículo para fijar el Resultado Oficial cuando se prescinde de la rotación automática.
- **Con una Autorización**: La autorización es el título habilitante que permite que una solicitud cambie el Resultado Oficial.
- **Con una Excepción**: La excepción desplaza la obligación laboral regular del Resultado Oficial.
- **Con una Solicitud**: Una solicitud es una expectativa que aspira a modificar el Resultado Oficial, pero carece de fuerza ejecutiva por sí sola.
- **Con el Historial**: Cada vez que el Resultado Oficial cambia respecto a lo planificado o a un resultado oficial anterior, debe generarse una traza en el Historial.

---

## 4. MATRIZ DE CONFLICTOS Y PRECEDENCIA

A continuación se analizan todas las colisiones posibles cuando para un mismo **(Empleado, Fecha)** concurren dos fuentes de información:

| Fuente A | Fuente B | ¿Pueden coexistir en el sistema? | ¿Cuál determina el Oficial según el prototipo actual? | ¿Cuál DEBERÍA determinar el Oficial en el Dominio? | Justificación / Decisión Pendiente |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **Planificación Base** | **Asignación Manual** | Sí | Asignación Manual | **Asignación Manual** | La orden expresa y directa del gestor se introduce precisamente para corregir o especificar la regla general. |
| **Planificación Base** | **Importación Excel** | Sí | Importación Excel | **NO DEFINIDO — REQUIERE DECISIÓN HUMANA** | Depende de si la importación se concibe como una "carga inicial de la planificación" o como un "ajuste operativo manual". |
| **Planificación Base** | **Solicitud Pendiente** | Sí | Planificación Base | **Planificación Base** | Una petición sin autorizar no puede alterar las obligaciones laborales vigentes. |
| **Planificación Base** | **Excepción (Vacación/Baja)** | Sí | Excepción | **Excepción** | Una causa justificada o de fuerza mayor suspende el turno base planificado. |
| **Planificación Base** | **Modificación Autorizada** | Sí | Modificación Autorizada | **Modificación Autorizada** | La aprobación formal del cambio vence al cálculo ordinario. |
| **Asignación Manual** | **Importación Excel** | Sí | El último que guarde | **NO DEFINIDO — REQUIERE DECISIÓN HUMANA** | Si el Excel sobreescribe asignaciones manuales previas sin advertencia, destruye el criterio del gestor local. |
| **Asignación Manual** | **Solicitud Pendiente** | Sí | Asignación Manual | **Asignación Manual** | La solicitud pendiente no altera nada; la asignación manual previa sigue rigiendo. |
| **Asignación Manual** | **Excepción (Baja/Vacaciones)** | Sí | Excepción | **NO DEFINIDO — REQUIERE DECISIÓN HUMANA** | ¿Prevalece una orden manual de un jefe ("Carlos viene de noche") o una baja médica sobrevenida? Jurídicamente rige la baja, pero en el prototipo técnico el comportamiento ante asignaciones previas tiene matices de fecha. |
| **Asignación Manual** | **Modificación Autorizada** | Sí | Modificación Autorizada | **NO DEFINIDO — REQUIERE DECISIÓN HUMANA** | ¿Qué ocurre si un gestor asigna manualmente Turno 1 y simultáneamente se aprueba una solicitud de Turno 2? Ambas son órdenes autorizadas. ¿Rige la más reciente en el tiempo? |
| **Importación Excel** | **Modificación Autorizada** | Sí | Modificación Autorizada (si se protege) | **NO DEFINIDO — REQUIERE DECISIÓN HUMANA** | El prototipo implementó un switch para no sobreescribir. Debe decidirse si las autorizaciones son siempre blindadas frente a cargas masivas. |
| **Importación Excel** | **Excepción** | Sí | Excepción | **NO DEFINIDO — REQUIERE DECISIÓN HUMANA** | ¿Puede un archivo Excel borrar unas vacaciones concedidas previamente si en esa casilla trae un código de turno de trabajo? |
| **Solicitud Pendiente** | **Excepción** | Sí | Excepción | **Excepción** | La excepción es un hecho consumado; la solicitud es solo un trámite pendiente. |
| **Solicitud Pendiente** | **Modificación Autorizada** | No deberían coexistir sobre el mismo turno | N/A | **NO DEFINIDO — REQUIERE DECISIÓN HUMANA** | Al autorizar una solicitud, deja de ser pendiente. Pero si un empleado tiene una solicitud pendiente de cambio y se le aprueba OTRA solicitud distinta, ¿se anula la primera? |
| **Excepción (Baja/Vacaciones)** | **Modificación Autorizada** | **SÍ (Conflicto Crítico)** | **Modificación Autorizada** | **NO DEFINIDO — REQUIERE DECISIÓN HUMANA** | **CASO CRÍTICO.** El prototipo otorga prioridad 1 a la Modificación Autorizada, ignorando la Excepción. Véase Sección 5. |
| **Permuta Autorizada** | **Excepción en uno de los dos** | Sí | Permuta Autorizada | **NO DEFINIDO — REQUIERE DECISIÓN HUMANA** | Si Pedro y Carlos permutan y a Carlos le dan la baja ese día, ¿qué turno oficial le queda a Pedro? Véase Sección 10. |

---

## 5. CASO CRÍTICO: EXCEPCIÓN VS MODIFICACIÓN AUTORIZADA

### Situación de conflicto
- **Empleado**: Carlos
- **Fecha**: 15 de octubre
- **Planificación base**: Turno 2
- **Hecho A**: Carlos tenía una Modificación Autorizada formalmente aprobada para hacer Turno 1 (o librar).
- **Hecho B**: Sobreviene o se registra una Excepción Activa (Incapacidad Temporal / Baja Médica o Vacaciones reglamentarias) que cubre el 15 de octubre.

### Comportamiento actual del prototipo
El prototipo en `officialScheduleResolver.ts` ejecuta primero la comprobación de `MODIFICACION_AUTORIZADA` (líneas 82–93). Por tanto, **la modificación autorizada aplasta a la excepción**. Si Carlos tenía aprobado un cambio a Turno 1, el sistema muestra oficialmente Turno 1, ignorando que está de baja médica.

### Alternativas de Dominio y Consecuencias

#### ALTERNATIVA 1: Prevalencia Absoluta de la Excepción (Causa de Fuerza Mayor / Derecho Laboral)
- **Principio**: Una baja por enfermedad, accidente o vacación consolidada anula cualquier obligación de prestar turno de trabajo, aunque previamente se hubiera acordado o autorizado un cambio.
- **Consecuencias**:
  - *Resultado Oficial*: Carlos figura en BAJA o VACACIONES.
  - *Trazabilidad*: La modificación autorizada previa queda en estado "suspendida" o "inaplicable por fuerza mayor".
  - *Historial*: Se registra la prevalencia de la contingencia sobrevenida.

#### ALTERNATIVA 2: Prevalencia de la Autorización (Decisión Específica Deroga Norma General)
- **Principio**: La autorización es un pacto o resolución bilateral expreso entre empleado y supervisor para esa fecha exacta, mientras que la excepción podría ser una etiqueta masiva de rango de fechas.
- **Riesgos y Consecuencias**:
  - *Riesgo Laboral*: Asignar a un empleado un turno activo de trabajo estando de baja médica puede constituir infracción laboral grave.
  - *Incoherencia*: Si Carlos pidió librar y luego le dan vacaciones, ambos coinciden en no trabajar; pero si pidió cambiar a un turno de noche y luego enferma, el sistema diría erróneamente que tiene turno de noche oficial.

#### ALTERNATIVA 3: Prevalencia Cronológica (El último evento registrado prevalece)
- **Principio**: Si la baja médica se registró el 10 de octubre y la solicitud se aprobó el 12 de octubre, se asume que el supervisor conocía la situación y tomó la decisión consciente. Si la baja se registró el 14 de octubre, deja sin efecto la autorización del día 12.
- **Consecuencias**:
  - Requiere un motor temporal que compare marcas de tiempo (`timestamps`) de creación/aprobación de ambos eventos.

> **ESTADO: NO DEFINIDO — REQUIERE DECISIÓN HUMANA DE GOBERNANZA.**

---

## 6. CASO: SOLICITUD PENDIENTE

### Comportamiento del prototipo actual
Una solicitud en estado `'PENDIENTE'` **no altera en ningún caso el Resultado Oficial** (`officialScheduleResolver.ts`, línea 77). Se limita a viajar como un metadato en la propiedad `TurnoOficialDia.solicitudPendiente` para pintar un icono o badge de reloj en la interfaz.

### Opciones conceptuales para el Dominio

1. **Opción A (Inmutabilidad estricta — Comportamiento actual)**:
   - Una solicitud es un mero deseo unilateral. El cuadrante oficial permanece 100% inalterado hasta que exista acto formal de aprobación.
   - *Ventaja*: Seguridad jurídica y operativa absoluta. Nadie asume que tiene libre un día solo por haberlo pedido.
2. **Opción B (Modificación Provisional o Cautelar)**:
   - Al registrar la solicitud, el cuadrante oficial muestra el turno solicitado de forma provisional (con advertencia de no confirmación), reservando el puesto para evitar que otro compañero lo pida.
   - *Desventaja*: Puede generar desabastecimiento de turnos o absentismo si el empleado confunde lo provisional con lo oficial.
3. **Opción C (Resultado Oficial Inalterado + Capa Visual de Tráfico)**:
   - El resultado oficial sigue siendo el planificado, pero las herramientas de supervisión computan la "cobertura proyectada" como si estuviera concedida para alertar de déficit de personal antes de autorizar.

> **ESTADO: Comportamiento actual (Opción A) es técnicamente seguro, pero REQUIERE RATIFICACIÓN HUMANA.**

---

## 7. CASO: SOLICITUD APROBADA VS RESULTADO OFICIAL MODIFICADO

### ¿Son necesariamente el mismo evento?
En el prototipo actual se asume que **aprobar equivale inmediatamente a aplicar** (`solicitudesUseCases.ts`, líneas 110–135). En el mismo instante en que el supervisor pulsa "Aprobar", el sistema escribe un registro en la tabla de asignaciones con `MODIFICACION_AUTORIZADA` y el cuadrante cambia al milisegundo.

### Decisión de Dominio pendiente:
¿Debe existir una distinción entre **Resolución Administrativa** y **Efectividad Operativa**?
- **Escenario 1 (Inmediatez)**: La aprobación genera ipso facto el resultado oficial modificado.
- **Escenario 2 (Diferimiento / Publicación)**: La solicitud es aprobada el martes, pero no entra en vigor hasta que el cuadrante del mes siguiente sea "publicado formalmente" o validado por un segundo nivel jerárquico (ej. Recursos Humanos tras el visto bueno del jefe de equipo).
- **Escenario 3 (Revocabilidad)**: ¿Puede una autorización aprobada ser revocada posteriormente si cambian las necesidades del servicio? En el prototipo actual, revocarla exigiría borrar manualmente la asignación generada.

> **ESTADO: NO DEFINIDO — REQUIERE DECISIÓN HUMANA.**

---

## 8. CASO: ASIGNACIÓN MANUAL POR UN GESTOR

### Situación:
- **Planificación por rotación**: Carlos → Turno 2 (Tarde).
- **Acción del Gestor**: Entra en el cuadrante y hace clic para cambiar a Carlos a Turno 3 (Noche).

### Cuestiones de Dominio que deben resolverse:
1. **¿Qué significa la asignación manual?**
   - ¿Es una enmienda puntual y aislada para ese día concreto?
   - ¿O significa que Carlos abandona la regla de rotación de su grupo a partir de ese momento?
2. **¿Qué sucede si posteriormente se reconfigura la regla de rotación del grupo?**
   - Si el supervisor cambia el ciclo de 8 a 14 días para el Grupo A, ¿la fecha en la que Carlos tenía una asignación manual debe recalculares con el nuevo ciclo o debe quedar congelada con la asignación manual del gestor?
3. **¿La asignación manual es un Resultado Oficial directo?**
   - En el prototipo sí: la asignación manual vence a la rotación base. Sin embargo, no exige motivo ni pasa por un flujo de solicitud formal. ¿Requiere justificación obligatoria para auditoría interna?

> **ESTADO: En el prototipo la asignación manual sobreescribe puntualmente a la rotación en esa fecha. REQUIERE CONFIRMACIÓN DE POLÍTICA DE NEGOCIO.**

---

## 9. CASO: IMPORTACIÓN DESDE EXCEL

### Situación:
- **Planificación calculada**: Carlos → Turno 2.
- **Archivo Excel importado**: Carlos → Turno 3 para la misma fecha.

### Disyuntiva de Dominio:
¿Cuál es la naturaleza ontológica de un dato importado de Excel en MIS TURNOS?

| Interpretación de la Importación | Comportamiento que se derivaría |
| :--- | :--- |
| **A. Carga de Planificación Base** | El Excel simplemente define el punto de partida (sustituye a la regla de rotación o al turno fijo). Cualquier excepción o solicitud posterior se aplica sobre él. |
| **B. Asignación Manual Masiva** | Equivale a que un gestor se hubiera sentado a introducir a mano los turnos de todos los trabajadores uno a uno. |
| **C. Fuente de Verdad Absoluta** | El Excel manda sobre todo lo existente en la base de datos (incluso borrando solicitudes previas). *Nota: Esto violaría el Principio 5 del README.* |
| **D. Ajuste Operativo con Protección (Prototipo Actual)** | El Excel se traduce en asignaciones con `origen: 'IMPORTACION'`. Si el usuario activa la casilla de protección, no toca las fechas que tengan `MODIFICACION_AUTORIZADA`. |

### Ambigüedad encontrada en el código:
El código actual permite optar entre sobreescribir o proteger modificaciones autorizadas, pero **no define qué hacer con las excepciones médicas ni con las solicitudes pendientes** si el Excel trae un turno de trabajo para un día donde había una baja o una petición pendiente.

> **ESTADO: NO DEFINIDO — REQUIERE DECISIÓN HUMANA.**

---

## 10. CASO: PERMUTA BILATERAL ENTRE EMPLEADOS

### Situación:
- **Carlos**: Turno 2 en Fecha 1.
- **Pedro**: Turno 3 en Fecha 2 (o en la misma Fecha 1).
- Se aprueba la solicitud de permuta.

### Cuestiones de Dominio Críticas:

1. **¿Es una operación única indivisible (Atómica) o dos modificaciones independientes?**
   - En el prototipo actual se programó como una **operación atómica indivisible**: la función `aprobarSolicitud` (`solicitudesUseCases.ts`, líneas 138–207) crea simultáneamente las dos asignaciones cruzadas. Si una fallara, ninguna debería aplicarse.
2. **¿Qué ocurre si posteriormente uno de los dos empleados entra en baja médica o causa baja en la empresa?**
   - Si Carlos y Pedro permutaron para el 20 de octubre, y el 18 de octubre Carlos causa baja en la empresa:
     - ¿Pedro debe seguir realizando el turno permutado de Carlos?
     - ¿O la permuta se anula automáticamente y Pedro debe regresar a su turno original planificado?
   - El código actual no contempla esta contingencia: Pedro conservaría el turno modificado asignado de por vida en esa fecha.
3. **¿Puede permutar un empleado con cualquier compañero o solo de su mismo grupo/cualificación?**
   - El prototipo actual permite en la interfaz de empleado solicitar permuta con cualquier compañero de la misma empresa, sin validar puestos, categorías profesionales ni grupos operativos.

> **ESTADO: La atomicidad inicial está resuelta en el prototipo, pero las contingencias sobrevenidas (anulación, bajas) y restricciones de categoría están NO DEFINIDAS — REQUIEREN DECISIÓN HUMANA.**

---

## 11. SÍNTESIS DE DECISIONES DE DOMINIO PENDIENTES DE VALIDACIÓN HUMANA

Para poder avanzar con seguridad hacia etapas posteriores, los responsables del proyecto deben dictaminar sobre los siguientes puntos clave:

1. **Regla de Prevalencia en Caso Crítico**: Dictaminar si ante la colisión `Excepción Activa (Baja/Vacaciones) vs Modificación Autorizada` debe prevalecer siempre la Excepción por razones de legalidad laboral.
2. **Naturaleza del Resultado Oficial**: Decidir si el Resultado Oficial debe ser una entidad histórica congelada periódicamente (inmutable tras el cierre de cuadrante) o un cálculo evaluado en tiempo real de forma continua.
3. **Rol de la Importación Excel**: Determinar si la importación masiva actúa como cargador de planificación base o como sobreescritura operativa.
4. **Ciclo de Vida de la Permuta**: Establecer si una permuta aprobada es un intercambio irreversible o si puede disolverse ante causas de fuerza mayor de uno de los participantes.
5. **Gobernanza de Asignaciones Manuales**: Validar si las intervenciones manuales directas del gestor sobre el cuadrante deben exigir justificación para integrarse en el Historial de trazabilidad.
