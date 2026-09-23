# MIS TURNOS — DOCUMENTO RECTOR DEL PROYECTO

> Este documento constituye la referencia rectora del proyecto **MIS TURNOS**. Debe consultarse antes de realizar cualquier intervención en el código o en la arquitectura.

---

## 1. PROPÓSITO DEL PROYECTO

**MIS TURNOS** es una aplicación web destinada a gestionar y planificar turnos laborales de una empresa.

El objetivo final del sistema es permitir:

- Gestionar empleados
- Organizar grupos de trabajo
- Definir turnos
- Definir reglas de rotación
- Planificar asignaciones
- Consultar calendarios
- Realizar solicitudes de cambio
- Gestionar autorizaciones
- Gestionar excepciones
- Registrar historial de cambios
- Importar y exportar información mediante Excel

El proyecto debe mantenerse **genérico**.  
**NO debe especializarse** para hospitales, clínicas, empresas de seguridad ni ningún otro sector específico.

---

## 2. CONCEPTO CENTRAL

MIS TURNOS no debe entenderse simplemente como un calendario.  
El calendario es una **representación visual** de la planificación.

El sistema debe distinguir conceptualmente de forma estricta:

- **PLANIFICACIÓN**: Lo que corresponde según las reglas y asignaciones de trabajo.
- **SOLICITUD**: Lo que un empleado pide modificar.
- **AUTORIZACIÓN**: La decisión formal tomada por una persona con autoridad.
- **RESULTADO OFICIAL**: El turno que finalmente corresponde al empleado para una fecha determinada.

Estos conceptos **no deben confundirse**.

### Ejemplo Conceptual

1. **Planificación**: Carlos → Turno 2
2. **Solicitud**: Carlos solicita Libre
3. **Autorización**: Solicitud aprobada por la persona autorizada
4. **Resultado oficial**: Carlos → Libre

---

## 3. MODALIDADES DE TRABAJO

El sistema debe poder representar inicialmente:

- **EMPLEADO FIJO**: Su planificación puede ser asignada directamente de forma continua o manual.
- **EMPLEADO ROTATIVO**: Su planificación puede determinarse mediante una regla de rotación (ciclo de días, fecha de anclaje y desfase).

*Nota:* No todos los empleados deben pertenecer obligatoriamente a una rotación.

---

## 4. PRINCIPIOS DEL PROYECTO

Estos principios deben respetarse durante todo el desarrollo:

- **PRINCIPIO 1**: El calendario es una representación del dominio, no el dominio.
- **PRINCIPIO 2**: La lógica de negocio no debe estar mezclada con componentes visuales.
- **PRINCIPIO 3**: Un empleado no modifica directamente el resultado oficial. Las modificaciones deben seguir el flujo correspondiente de solicitud y autorización cuando corresponda.
- **PRINCIPIO 4**: Las decisiones autorizadas deben poder rastrearse (trazabilidad e historial).
- **PRINCIPIO 5**: Excel será un mecanismo de importación y exportación. No debe convertirse en la fuente definitiva de verdad del sistema.
- **PRINCIPIO 6**: La aplicación debe poder evolucionar posteriormente hacia:
  `Frontend → API / Backend → Base de datos`.
- **PRINCIPIO 7**: La aplicación debe mantenerse genérica y preparada para diferentes tipos de empresas (aislamiento multi-empresa).
- **PRINCIPIO 8**: No implementar complejidad que todavía no haya sido necesaria.

---

## 5. ARQUITECTURA GENERAL

La arquitectura deberá mantener y evolucionar hacia una separación conceptual limpia:

```
PRESENTACIÓN (Interfaz de usuario React, componentes, vistas)
       ↓
APLICACIÓN / CASOS DE USO (Coordinación de flujos y operaciones)
       ↓
DOMINIO / LÓGICA DE NEGOCIO (Entidades, reglas de rotación, resolución oficial)
       ↓
PERSISTENCIA / INFRAESTRUCTURA (Repositorio, almacenamiento, Excel)
```

- La interfaz visual no debe contener las reglas principales del sistema.
- El dominio debe poder probarse de forma independiente de React y de la capa visual.

---

## 6. CONCEPTOS PRINCIPALES

El sistema contempla inicialmente los siguientes conceptos:

- **Empresa**
- **Usuario**
- **Empleado**
- **Grupo**
- **Turno**
- **Regla de Rotación**
- **Asignación**
- **Excepción**
- **Solicitud**
- **Autorización**
- **Historial**
- **Importación / Exportación**

Esta lista representa el modelo conceptual inicial.  
**NO agregues nuevas entidades** simplemente por conveniencia técnica.  
Si durante una etapa futura aparece una necesidad real que requiera un nuevo concepto, esa decisión deberá documentarse antes de implementarse.

---

## 7. ESTADO DEL PROYECTO

**ESTADO ACTUAL: FUNDACIÓN INICIAL.**

El proyecto se encuentra en una etapa temprana de construcción.  
El código existente debe considerarse una primera implementación técnica y **NO una definición definitiva del dominio**.  
Antes de ampliar funcionalidades, debe verificarse que la implementación respete este documento rector.

---

## 8. REGLA FUNDAMENTAL PARA AI

Este README debe considerarse una **referencia permanente del proyecto**.

**ANTES DE MODIFICAR EL CÓDIGO:**
1. Leer este README.
2. Identificar el estado actual del proyecto.
3. Determinar qué etapa de desarrollo está autorizada.
4. No implementar funcionalidades pertenecientes a etapas posteriores.
5. No inventar reglas de negocio.
6. No introducir entidades innecesarias.
7. No sustituir decisiones del proyecto por decisiones propias.

**Si una decisión importante no está definida:**
NO asumirla silenciosamente. Se debe:
- Identificar la ambigüedad.
- Explicarla.
- Proponer una alternativa si es necesario.
- Esperar confirmación cuando la decisión afecte al dominio.

---

## 9. DESARROLLO POR ETAPAS

El proyecto debe desarrollarse progresivamente:

### ETAPA 1 — FUNDACIÓN
Crear una base técnica limpia: React, TypeScript, Vite, estructura de carpetas, separación inicial de responsabilidades, tipos básicos, documentación e interfaz mínima de funcionamiento.  
*(NO incluye todavía una implementación completa del sistema).*

### ETAPA 2 — MODELO DE DOMINIO
Definir con precisión: Empresa, Usuario, Empleado, Grupo, Turno, Regla de Rotación, Asignación, Excepción, Solicitud, Autorización, Historial antes de desarrollar funcionalidades complejas.

### ETAPA 3 — MOTOR DE PLANIFICACIÓN
Implementar progresivamente: empleados fijos, empleados rotativos, reglas de rotación, asignaciones y resolución de planificación. La lógica debe probarse independientemente de la interfaz.

### ETAPA 4 — GESTIÓN
Construir progresivamente: empleados, grupos, turnos, reglas, planificación y calendario.

### ETAPA 5 — SOLICITUDES Y AUTORIZACIONES
Implementar: solicitudes, cambios de turno, días libres, permutas, autorizaciones, aplicación de cambios e historial.

### ETAPA 6 — IMPORTACIÓN Y EXPORTACIÓN
Implementar: importación Excel, validación, detección de errores, aplicación controlada y exportación.

### ETAPA 7 — PERSISTENCIA Y EVOLUCIÓN
Posteriormente: `Frontend → API → Base de datos`. La arquitectura debe permitir esta evolución sin reconstruir completamente el dominio.

---

## 10. LO QUE NO DEBE HACERSE SIN AUTORIZACIÓN

**NO implementar por iniciativa propia:**
- Autenticación real o servicios externos de identidad
- Backend o servidores dedicados
- Base de datos relacional externa sin solicitud explícita
- Notificaciones push o por email
- Permisos avanzados no definidos
- Integración con servicios externos
- Algoritmos complejos de optimización automática
- Inteligencia artificial
- Reglas laborales específicas de un país o convenio colectivo
- Funcionalidades empresariales no solicitadas

Estas funcionalidades podrán incorporarse únicamente en etapas posteriores cuando sean autorizadas.

---

## 11. DATOS DE DEMOSTRACIÓN

Durante las primeras etapas pueden utilizarse datos temporales únicamente cuando sean necesarios para comprobar una funcionalidad.  
Sin embargo:
- Deben estar claramente identificados como datos de desarrollo.
- No deben confundirse con datos reales.
- No deben convertirse en parte del modelo de negocio.
- No deben utilizar nombres o información personal real.
- Cuando una funcionalidad pueda probarse sin datos previos, debe preferirse esa alternativa.
