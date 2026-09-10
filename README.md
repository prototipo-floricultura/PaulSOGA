# Orientación tecnológica para floricultura

Prototipo académico basado en reglas, asociado al TFE **Propuesta de solución digital inicial basada en tecnologías de Industria 4.0 para empresas floricultoras de la Sabana de Cundinamarca**, de Paul Albert Soltys Galvis.

## Herramienta y descarga

- [Descargar la herramienta completa con código, manual y pruebas](./Herramienta_TFE_Floricultura.zip).
- [Consultar el motor de reglas](./motor.js) y [la lógica de la interfaz](./app.js).
- [Consultar la documentación](./LEEME.html).
- [Consultar las 19 condiciones y su correspondencia H/R](./trazabilidad.csv).

Para utilizarla sin instalación, descargue el ZIP, extraiga su contenido y abra **index.html** en un navegador con JavaScript. Conserve juntos los archivos de la carpeta. No necesita crear una cuenta ni mantener una conexión a Internet para evaluar las condiciones.

La aplicación utiliza únicamente archivos del propio paquete: `index.html` contiene la estructura, `estilos.css` el diseño, `motor.js` las reglas y `app.js` la interacción. No carga bibliotecas ni servicios de terceros. El repositorio y el ZIP incluyen los archivos fuente legibles, el manual, las pruebas y las sumas de integridad SHA-256.

La versión 1.2.0 reemplaza la distribución anterior. Utilice la descarga actual: se separaron los archivos de la aplicación, se restringió la ejecución de scripts y se reconstruyó la interfaz mediante nodos de texto. Consulte [SEGURIDAD.md](./SEGURIDAD.md) para conocer el alcance de la revisión.

## Qué hace

La herramienta recibe **19 condiciones** con estados **Sí**, **No** y **No comprobado**, recorre **cinco fases** y señala la primera fase pendiente. Explica las condiciones que impiden avanzar, las evidencias necesarias y la relación con los hallazgos H y requisitos R del TFE.

1. **Alineación:** alcance, gobierno del dato, línea base y recursos preliminares.
2. **Captura básica:** formatos, desconexión, mantenimiento, seguridad, formación y registros por lote.
3. **Nube y tableros:** consolidación de registros, accesos e información operativa.
4. **Calidad asistida:** se activa únicamente ante una necesidad visual comprobada.
5. **Trazabilidad ampliada:** se activa ante una necesidad comprobada y exige los registros base.

La numeración interna del TFE se conserva como fases **0 a 4**. Las fases 0, 1 y 2 son secuenciales. Las fases condicionadas no se activan por mera disponibilidad tecnológica; la fase 4 no obliga a usar inteligencia artificial cuando no es necesaria.

## Uso

Navegue por las fases y seleccione Sí solo cuando disponga de evidencia verificable, No cuando haya confirmado su ausencia y No comprobado cuando la información no sea suficiente. Puede generar la orientación en cualquier momento: las condiciones no revisadas mantienen el estado No comprobado.

Los contadores muestran respuestas con Sí o No, no un porcentaje de cumplimiento ni un índice de madurez. Si modifica las respuestas después de obtener el resultado, vuelva a generar la orientación. La opción **Imprimir resultado** permite imprimir o guardar un PDF mediante el navegador.

Los tres casos incluidos son **ejemplos ficticios** para comprobar el comportamiento del programa. No representan empresas, participantes ni resultados adicionales del trabajo de campo.

## Pruebas reproducibles

Después de extraer el paquete completo, con Node.js 18 o posterior, ejecute desde la carpeta extraída:

```text
node reglas.test.cjs
node verificar.cjs
```

Se comprobaron **12 pruebas del motor, con 12 aprobadas y cero fallidas**, junto con la sintaxis, la tabla de 19 condiciones, la integridad del ZIP y sus sumas SHA-256. La lógica de las reglas se mantiene sin cambios respecto del prototipo incluido en la revisión del TFE. Estas pruebas de software no constituyen una validación empresarial, una certificación ni una aprobación académica.

## Alcance e integridad académica

No es un clasificador predictivo ni un modelo de aprendizaje automático entrenado. No estima probabilidades, no calcula una puntuación de madurez y no comprueba por sí mismo la autenticidad de las evidencias. La salida orienta una revisión humana y debe contrastarse antes de invertir, implementar o escalar una solución.

Las ocho personas consultadas en el estudio no se convierten en ocho empresas clasificadas. Los datos del estudio fundamentan los hallazgos y requisitos, no un entrenamiento automático del programa.

## Privacidad y autoría

La aplicación no solicita datos personales, no recibe archivos, no guarda respuestas y no las transmite. Este repositorio no incluye entrevistas, consentimientos, firmas, grabaciones ni bases de participantes. En una versión alojada, el proveedor puede tratar los datos técnicos normales de acceso a la web, distintos del contenido de las respuestas.

Proyecto académico de Paul Albert Soltys Galvis. Se utilizó asistencia de inteligencia artificial para programación, edición y comprobaciones técnicas; no para fabricar resultados empíricos. La disponibilidad del código para revisión no equivale a otorgar una licencia general de software libre.

## Archivos

| Archivo | Función |
| --- | --- |
| index.html | Página de entrada |
| estilos.css | Diseño adaptable e impresión |
| motor.js | Catálogo de condiciones y reglas de decisión |
| app.js | Formulario, navegación y resultados |
| LEEME.html, manual.css | Manual de uso |
| trazabilidad.csv | Correspondencia entre condiciones, hallazgos y requisitos |
| reglas.test.cjs | Doce pruebas reproducibles |
| verificar.cjs | Comprobaciones estructurales y de seguridad del código |
| empaquetar.cjs | Generación reproducible de la entrega ZIP |
| SEGURIDAD.md | Alcance de la revisión y aviso de sustitución |
| SHA256SUMS.txt | Integridad de los archivos de la entrega |

**Versión:** 1.2.0 · **Fecha:** 10 de septiembre de 2026.
