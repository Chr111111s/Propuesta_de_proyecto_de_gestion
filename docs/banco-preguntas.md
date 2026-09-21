# Banco de Preguntas Difíciles — PiñaLog 360

## Cómo usar este documento

Cada respuesta está pensada para durar entre 20 y 30 segundos. La idea es sonar seguros, concretos y orientados a negocio.

## Viabilidad técnica

### 1. ¿Por qué eligieron FastAPI y no otra tecnología?
Porque FastAPI permite construir APIs rápidas, limpias y fáciles de documentar. Para una solución logística, eso nos ayuda a demostrar integración, escalabilidad y claridad técnica sin agregar complejidad innecesaria.

### 2. ¿Por qué usan SQLite si dicen que el sistema puede crecer?
Porque esta versión es un MVP académico. SQLite reduce fricción para correr la demo localmente. La arquitectura ya separa lógica, API y datos, así que migrar a PostgreSQL en una siguiente fase es viable.

### 3. ¿Cómo aseguran que el inventario no quede inconsistente?
La lógica del backend valida que no se pueda registrar una salida si el lote no existe o si no hay inventario suficiente. Eso evita errores operativos básicos y protege la consistencia del stock.

### 4. ¿Qué pasa si dos usuarios usan el sistema al mismo tiempo?
En esta fase el sistema está orientado a demo local. Para una fase productiva proponemos migrar a una base multiusuario y agregar control de concurrencia, sesiones y auditoría completa.

## Costos y rentabilidad

### 5. ¿Cómo justifican económicamente el proyecto?
Lo justificamos por el ahorro en merma, el mejor uso de rutas y la reducción de tiempos muertos. Incluso con una mejora moderada, el impacto económico supera rápido el costo de un MVP bien implementado.

### 6. ¿No sería más barato usar Excel?
Excel sirve para registrar, pero no para asegurar trazabilidad, validación operativa y actualización automática entre inventario, bitácora y rutas. Nuestro valor está en conectar la operación completa y no solo en almacenar filas.

### 7. ¿Cómo calculan el ROI si aún no tienen un cliente real?
Usamos un escenario base con supuestos razonables de volumen, merma y costo logístico. No lo presentamos como cifra cerrada, sino como una estimación defendible para validar la oportunidad de negocio.

## Competencia y diferenciación

### 8. ¿Qué diferencia a PiñaLog 360 de un ERP genérico?
Un ERP genérico requiere mucha parametrización. PiñaLog 360 nace centrado en el flujo específico de piñas: lotes, perecibilidad, movimientos, cobertura estatal y plantilla logística lista para operación.

### 9. ¿Qué pasa si el cliente maneja otras frutas además de piña?
La lógica actual está enfocada en piñas para demostrar especialización, pero la estructura del sistema permite extender el catálogo a otros productos sin rehacer la base del software.

### 10. ¿Por qué especializarse en piñas y no hacer algo más general desde el inicio?
Porque una solución vertical es más fácil de vender y validar: resuelve dolores concretos, reduce alcance inicial y demuestra valor rápidamente. Después se puede expandir a otros productos.

## Seguridad y datos

### 11. ¿Cómo protegen la información sensible?
En esta etapa protegemos la estructura y consistencia del sistema. En una siguiente fase integraríamos autenticación, roles, cifrado y bitácora de auditoría para cumplir un estándar empresarial.

### 12. ¿Qué pasa si alguien registra datos erróneos?
El sistema ya valida campos obligatorios y reglas críticas de inventario. La siguiente mejora sería agregar permisos, historial de cambios y procesos de aprobación para movimientos sensibles.

## Escalabilidad y operación

### 13. ¿Cómo escalaría este sistema a nivel estatal o regional?
La arquitectura ya separa frontend, API y persistencia. Eso permite reemplazar la base local por una más robusta, desplegar la API en la nube y agregar más centros logísticos sin rehacer el diseño central.

### 14. ¿Qué harían si un transportista entra en mantenimiento y afecta entregas?
El sistema ya muestra rutas en mantenimiento y capacidad por estado. Eso permite detectar impacto operativo y reprogramar distribución con base en datos en lugar de hacerlo de forma reactiva.

### 15. ¿Qué sigue después del MVP?
La ruta natural es agregar autenticación, filtros, reportes avanzados, historial de mantenimiento, despliegue cloud y analítica histórica. El MVP ya prueba que el flujo central y la narrativa de negocio son viables.

## Cierre corto para preguntas difíciles

Si una pregunta se pone muy técnica, pueden cerrar así:

“En esta fase priorizamos validar el flujo logístico crítico y demostrar el valor de negocio. La arquitectura ya deja preparada la evolución hacia un entorno más robusto.”
