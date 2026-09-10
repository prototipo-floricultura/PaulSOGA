# Revisión de seguridad y versión vigente

La versión vigente es **1.2.0**, de 10 de septiembre de 2026. Sustituye el paquete 1.1.0.

## Incidencia de la versión anterior

Microsoft Defender identificó una copia de la distribución 1.1.0 con la detección `Trojan:Script/Ulthar.A!ml` y aplicó su protección. La consulta del registro no mostró ejecución de esa amenaza. No se ha obtenido una confirmación del fabricante que permita calificar la detección como falso positivo.

No restaure esa copia ni excluya carpetas del antivirus. Utilice únicamente la distribución vigente. Una comprobación funcional previa de las reglas no sustituye la revisión de seguridad.

## Cambios de la versión 1.2.0

- Interfaz, estilos y reglas distribuidos en archivos separados y legibles.
- Política de contenido que permite únicamente scripts y estilos del propio paquete, sin ejecución inline.
- Formulario y resultados construidos con nodos de texto del DOM, sin insertar cadenas de HTML ejecutable.
- Sin evaluación dinámica de código, descodificación de cargas, solicitudes de red, persistencia, telemetría, contraseñas, servicios externos ni manejo de archivos de usuarios.
- Retirada de la integración experimental de control por agentes, ajena al uso manual requerido por el proyecto.
- Motor de 19 condiciones y cinco fases conservado, con comparación exacta de su código y doce pruebas reproducibles.

## Alcance de las comprobaciones

`verificar.cjs` comprueba la estructura, la política de contenido, las referencias locales, la ausencia de determinadas API no necesarias y la identidad del motor respecto de la versión académica revisada. Es una revisión estática acotada, no una certificación universal de seguridad.

El análisis antivirus local se realiza con Microsoft Defender activo, sin añadir exclusiones, restaurar archivos bloqueados ni desactivar protecciones. El resultado solo describe el paquete y las firmas utilizados en ese momento; no garantiza que todos los productos de seguridad emitan la misma clasificación en el futuro.

En la comprobación local del 10 de septiembre de 2026, el análisis personalizado de Microsoft Defender de la versión 1.2.0 finalizó sin registrar detecciones para sus archivos. Las doce pruebas del motor y la verificación estructural también finalizaron satisfactoriamente.
