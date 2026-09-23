import React, { useState, useRef } from 'react';
import {
  FileSpreadsheet,
  Download,
  UploadCloud,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  FileCheck,
  Layers,
  ArrowRight,
} from 'lucide-react';
import {
  exportarCuadranteExcel,
  validarArchivoExcel,
  aplicarImportacionExcel,
  ResultadoValidacionImportacion,
} from '../../usecases/excelUseCases.ts';

interface ExcelCenterViewProps {
  empresaId: string;
  onDatosCambiados: () => void;
}

export const ExcelCenterView: React.FC<ExcelCenterViewProps> = ({
  empresaId,
  onDatosCambiados,
}) => {
  const [fechaInicioExport, setFechaInicioExport] = useState('2026-09-01');
  const [fechaFinExport, setFechaFinExport] = useState('2026-09-30');

  // Estado de importación
  const [archivoSeleccionado, setArchivoSeleccionado] = useState<File | null>(null);
  const [validacion, setValidacion] = useState<ResultadoValidacionImportacion | null>(null);
  const [protegerAutorizados, setProtegerAutorizados] = useState(true);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDescargarCuadrante = () => {
    exportarCuadranteExcel(empresaId, fechaInicioExport, fechaFinExport);
  };

  const handleDescargarPlantilla = () => {
    exportarCuadranteExcel(empresaId, '2026-10-01', '2026-10-15');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setArchivoSeleccionado(file);
    setMensajeExito(null);
    setIsProcessing(true);

    try {
      const buffer = await file.arrayBuffer();
      const res = validarArchivoExcel(buffer, empresaId);
      setValidacion(res);
    } catch (err: any) {
      alert('Error al leer el archivo Excel: ' + (err.message || 'Formato no soportado'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAplicarImportacion = () => {
    if (!validacion || validacion.filasAceptadas.length === 0) return;

    const res = aplicarImportacionExcel(empresaId, validacion.filasAceptadas, {
      sobrescribirModificacionesAutorizadas: !protegerAutorizados,
      usuarioNombre: 'Responsable de Planificación (Excel)',
    });

    setMensajeExito(
      `Importación aplicada con éxito: ${res.aplicadas} asignaciones actualizadas en la planificación. ${
        res.omitidasPorProteccion > 0
          ? `${res.omitidasPorProteccion} modificaciones autorizadas fueron preservadas de forma segura.`
          : ''
      }`
    );

    setArchivoSeleccionado(null);
    setValidacion(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onDatosCambiados();
  };

  return (
    <div className="space-y-6">
      {/* Banner Explicativo de Principios de Excel */}
      <div className="bg-slate-900 text-white rounded-xl p-5 shadow-sm space-y-2">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
          <h2 className="text-base font-semibold">Integración y Pasarela con Excel</h2>
        </div>
        <p className="text-xs text-slate-300 max-w-3xl">
          Excel es un mecanismo bidireccional de <strong>importación</strong> y <strong>exportación</strong>, no la fuente única de verdad. Toda importación es validada antes de aplicarse y cuenta con mecanismos de protección para no destruir modificaciones oficiales aprobadas previamente.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* BLOQUE EXPORTACIÓN */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Download className="w-4 h-4 text-emerald-600" />
            <h3 className="font-semibold text-sm text-slate-900">Exportar Datos a Excel</h3>
          </div>

          <p className="text-xs text-slate-600">
            Descarga una planilla con el cuadrante oficial calculado, el desglose de horas por trabajador, la leyenda completa de turnos y una plantilla lista para rellenar.
          </p>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-500 mb-1 font-medium">Desde:</label>
              <input
                type="date"
                value={fechaInicioExport}
                onChange={(e) => setFechaInicioExport(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1 font-medium">Hasta:</label>
              <input
                type="date"
                value={fechaFinExport}
                onChange={(e) => setFechaFinExport(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 font-mono"
              />
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={handleDescargarCuadrante}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition-colors shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Descargar Cuadrante Oficial (.xlsx)</span>
            </button>
            <button
              type="button"
              onClick={handleDescargarPlantilla}
              className="flex items-center justify-center gap-2 px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium transition-colors"
            >
              <span>Plantilla en Blanco</span>
            </button>
          </div>
        </div>

        {/* BLOQUE IMPORTACIÓN */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <UploadCloud className="w-4 h-4 text-blue-600" />
            <h3 className="font-semibold text-sm text-slate-900">Importar Planificación desde Excel</h3>
          </div>

          <p className="text-xs text-slate-600">
            Sube un archivo <code>.xlsx</code> o <code>.csv</code>. El sistema verificará los códigos de empleado y turno, detectará discrepancias y te permitirá decidir qué hacer con las modificaciones autorizadas.
          </p>

          {/* Zona de Drop / Carga */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-50 hover:bg-blue-50/30"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <FileSpreadsheet className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <div className="text-xs font-medium text-slate-800">
              {archivoSeleccionado ? archivoSeleccionado.name : 'Haz clic para seleccionar tu archivo Excel'}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Compatible con formato estándar de importación (.xlsx, .csv)
            </div>
          </div>
        </div>
      </div>

      {/* MENSAJE DE ÉXITO TRAS APLICAR */}
      {mensajeExito && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-xl text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{mensajeExito}</span>
        </div>
      )}

      {/* RESULTADO DE LA VALIDACIÓN PREVIA (ANTES DE APLICAR) */}
      {validacion && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-semibold text-sm text-slate-900">
                Resultado de la Validación Previa
              </h3>
              <p className="text-xs text-slate-500">
                Archivo analizado: {archivoSeleccionado?.name} · {validacion.totalFilas} registros encontrados
              </p>
            </div>

            {/* Resumen numérico */}
            <div className="flex items-center gap-3 text-xs font-medium">
              <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                ✓ {validacion.filasAceptadas.length} válidas
              </span>
              {validacion.conflictos.length > 0 && (
                <span className="text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                  ⚠ {validacion.conflictos.length} con autorizaciones previas
                </span>
              )}
              {validacion.filasConError.length > 0 && (
                <span className="text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                  ✕ {validacion.filasConError.length} con errores
                </span>
              )}
            </div>
          </div>

          {/* Detección de Conflictos con Modificaciones Autorizadas */}
          {validacion.conflictos.length > 0 && (
            <div className="bg-amber-50/80 border border-amber-300 rounded-xl p-3.5 space-y-2 text-xs text-amber-900">
              <div className="flex items-center gap-2 font-semibold text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>
                  Atención: Se han detectado {validacion.conflictos.length} registros que colisionan con modificaciones autorizadas o excepciones
                </span>
              </div>
              <p className="text-[11px] text-amber-800/90">
                Ejemplo: El empleado tiene un día libre o permuta aprobada por un supervisor. Para evitar destruir información acordada, puedes elegir proteger dichas autorizaciones.
              </p>

              {/* Checkbox de Protección */}
              <label className="flex items-center gap-2 pt-1 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={protegerAutorizados}
                  onChange={(e) => setProtegerAutorizados(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                />
                <span className="text-amber-950">
                  <strong>Proteger modificaciones autorizadas (Recomendado):</strong> Mantener los cambios aprobados por supervisores y no sobreescribirlos.
                </span>
              </label>
            </div>
          )}

          {/* Errores detectados si los hay */}
          {validacion.filasConError.length > 0 && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-800 space-y-1.5">
              <div className="font-semibold flex items-center gap-1.5">
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>Registros con errores que no podrán importarse:</span>
              </div>
              <ul className="list-disc pl-5 space-y-0.5 max-h-32 overflow-y-auto font-mono text-[11px]">
                {validacion.filasConError.map((err, i) => (
                  <li key={i}>
                    Fila {err.filaNumero}: {err.error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Previsualización de Filas Válidas a Importar */}
          <div>
            <div className="text-xs font-semibold text-slate-700 mb-2">
              Previsualización de Asignaciones a Aplicar (primeras 10 filas):
            </div>
            <div className="border border-slate-200 rounded-lg overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                  <tr>
                    <th className="py-2 px-3">Fila</th>
                    <th className="py-2 px-3">Empleado</th>
                    <th className="py-2 px-3">Fecha</th>
                    <th className="py-2 px-3">Turno a Asignar</th>
                    <th className="py-2 px-3">Notas</th>
                    <th className="py-2 px-3">Estado Conflicto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {validacion.filasAceptadas.slice(0, 10).map((fila) => (
                    <tr key={fila.filaNumero} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-mono text-slate-400">#{fila.filaNumero}</td>
                      <td className="py-2 px-3 font-medium text-slate-800">
                        {fila.empleadoNombre}{' '}
                        <span className="font-mono text-slate-400 text-[11px]">
                          ({fila.identificacionInterna})
                        </span>
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-700">{fila.fecha}</td>
                      <td className="py-2 px-3 font-bold font-mono text-blue-600">
                        {fila.turnoCodigo}
                      </td>
                      <td className="py-2 px-3 text-slate-500">{fila.notas || '-'}</td>
                      <td className="py-2 px-3">
                        {fila.tieneConflicto ? (
                          <span className="text-[11px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded font-medium">
                            {protegerAutorizados ? 'Se conservará autorización' : 'Se sobreescribirá'}
                          </span>
                        ) : (
                          <span className="text-[11px] text-emerald-700">Sin conflicto</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Acciones de Confirmación */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setValidacion(null);
                setArchivoSeleccionado(null);
              }}
              className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleAplicarImportacion}
              disabled={validacion.filasAceptadas.length === 0}
              className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Aplicar {validacion.filasAceptadas.length} Asignaciones al Cuadrante</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
