/**
 * Logo de ZANFIT, igual al ícono de la app (mismo estilo que Alarma Comunitaria): "ZF" grande y "ZANFIT" abajo, en
 * negro sobre lima. `tamano` es el lado del cuadrado en px.
 */
export default function Marca({ tamano = 88, className = '' }: { tamano?: number; className?: string }) {
  return (
    <span
      role="img"
      aria-label="ZANFIT"
      className={`inline-flex shrink-0 flex-col items-center justify-center bg-lima font-marca text-fondo ${className}`}
      style={{ width: tamano, height: tamano, borderRadius: tamano * 0.22 }}
    >
      <span className="font-bold" style={{ fontSize: tamano * 0.44, lineHeight: 0.8, letterSpacing: '-0.04em', marginTop: tamano * 0.03 }}>
        ZF
      </span>
      {tamano >= 40 && (
        <span className="font-semibold" style={{ fontSize: tamano * 0.088, letterSpacing: '0.2em', paddingLeft: '0.2em', marginTop: tamano * 0.07 }}>
          ZANFIT
        </span>
      )}
    </span>
  )
}
